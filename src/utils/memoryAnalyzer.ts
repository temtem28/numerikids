export interface MemoryObject {
  id: string;
  address: string;
  type: string;
  value: any;
  refCount: number;
  referencedBy: string[];
}

export interface MemoryState {
  objects: Map<string, MemoryObject>;
  variableRefs: Map<string, string>;
  connections: Array<{ from: string; to: string }>;
}

let addressCounter = 0x1000;
const objectCache = new WeakMap<any, string>();

export function analyzeMemory(variables: Record<string, any>): MemoryState {
  const objects = new Map<string, MemoryObject>();
  const variableRefs = new Map<string, string>();
  const connections: Array<{ from: string; to: string }> = [];
  const valueToId = new Map<any, string>();

  const createAddress = (): string => {
    const addr = `0x${addressCounter.toString(16).toUpperCase().padStart(4, '0')}`;
    addressCounter += 8;
    return addr;
  };

  const getObjectId = (value: any): string | null => {
    // For primitives and null, check if we've seen this exact value
    if (value === null || typeof value !== 'object') {
      // Python interns small integers and strings
      if (typeof value === 'number' && value >= -5 && value <= 256) {
        return valueToId.get(value) || null;
      }
      if (typeof value === 'string' && value.length < 20) {
        return valueToId.get(value) || null;
      }
      return null;
    }
    
    // For objects, use WeakMap
    return objectCache.get(value) || null;
  };

  const createObject = (value: any, varName?: string): string => {
    const existingId = getObjectId(value);
    if (existingId && objects.has(existingId)) {
      const obj = objects.get(existingId)!;
      obj.refCount++;
      if (varName) obj.referencedBy.push(varName);
      return existingId;
    }

    const id = `obj_${objects.size}`;
    const address = createAddress();
    const type = Array.isArray(value) ? 'list' : 
                 value === null ? 'NoneType' :
                 typeof value === 'object' ? 'dict' : 
                 typeof value === 'number' ? 'int' :
                 typeof value === 'string' ? 'str' :
                 typeof value === 'boolean' ? 'bool' : typeof value;

    const obj: MemoryObject = {
      id,
      address,
      type,
      value,
      refCount: 1,
      referencedBy: varName ? [varName] : []
    };

    objects.set(id, obj);

    // Cache the object
    if (typeof value === 'object' && value !== null) {
      objectCache.set(value, id);
    } else {
      valueToId.set(value, id);
    }

    // Process nested structures
    if (Array.isArray(value)) {
      value.forEach((item, idx) => {
        if (typeof item === 'object' && item !== null) {
          const itemId = createObject(item, `${varName}[${idx}]`);
          connections.push({ from: id, to: itemId });
        }
      });
    } else if (typeof value === 'object' && value !== null) {
      Object.entries(value).forEach(([key, val]) => {
        if (typeof val === 'object' && val !== null) {
          const valId = createObject(val, `${varName}['${key}']`);
          connections.push({ from: id, to: valId });
        }
      });
    }

    return id;
  };

  // Process all variables
  Object.entries(variables).forEach(([name, value]) => {
    const objId = createObject(value, name);
    variableRefs.set(name, objId);
  });

  return { objects, variableRefs, connections };
}

export function resetMemoryAnalyzer(): void {
  addressCounter = 0x1000;
}
