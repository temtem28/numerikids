// Device detection utilities
export function getDeviceInfo() {
  const ua = navigator.userAgent;
  
  // Detect browser
  let browser = 'Unknown';
  let browserVersion = '';
  if (ua.includes('Firefox/')) {
    browser = 'Firefox';
    browserVersion = ua.split('Firefox/')[1]?.split(' ')[0] || '';
  } else if (ua.includes('Chrome/') && !ua.includes('Edg')) {
    browser = 'Chrome';
    browserVersion = ua.split('Chrome/')[1]?.split(' ')[0] || '';
  } else if (ua.includes('Safari/') && !ua.includes('Chrome')) {
    browser = 'Safari';
    browserVersion = ua.split('Version/')[1]?.split(' ')[0] || '';
  } else if (ua.includes('Edg/')) {
    browser = 'Edge';
    browserVersion = ua.split('Edg/')[1]?.split(' ')[0] || '';
  }

  // Detect OS
  let os = 'Unknown';
  let osVersion = '';
  if (ua.includes('Windows NT')) {
    os = 'Windows';
    osVersion = ua.split('Windows NT ')[1]?.split(';')[0] || '';
  } else if (ua.includes('Mac OS X')) {
    os = 'macOS';
    osVersion = ua.split('Mac OS X ')[1]?.split(')')[0]?.replace(/_/g, '.') || '';
  } else if (ua.includes('Linux')) {
    os = 'Linux';
  } else if (ua.includes('Android')) {
    os = 'Android';
    osVersion = ua.split('Android ')[1]?.split(';')[0] || '';
  } else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) {
    os = 'iOS';
  }

  // Detect device type
  let deviceType = 'desktop';
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    deviceType = 'tablet';
  } else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    deviceType = 'mobile';
  }

  return {
    browser,
    browserVersion,
    os,
    osVersion,
    deviceType,
    userAgent: ua,
  };
}

export function getDeviceId(): string {
  let deviceId = localStorage.getItem('deviceId');
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem('deviceId', deviceId);
  }
  return deviceId;
}

export async function getIPAddress(): Promise<string> {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch {
    return 'Unknown';
  }
}
