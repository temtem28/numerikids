import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ChatInterface } from './messaging/ChatInterface';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { MessageSquare, X } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';

interface MessagingPanelProps {
  currentUserId: string;
  userRole: 'parent' | 'child';
}

export function MessagingPanel({ currentUserId, userRole }: MessagingPanelProps) {
  const [contacts, setContacts] = useState<any[]>([]);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadContacts();
    loadUnreadCounts();
    const interval = setInterval(loadUnreadCounts, 5000);
    return () => clearInterval(interval);
  }, [currentUserId, userRole]);

  const loadContacts = async () => {
    if (userRole === 'parent') {
      const { data } = await supabase
        .from('children')
        .select('id, name, avatar_url')
        .eq('parent_id', currentUserId);
      if (data) setContacts(data);
    } else {
      const { data: childData } = await supabase
        .from('children')
        .select('parent_id')
        .eq('id', currentUserId)
        .single();
      
      if (childData) {
        const { data: parentData } = await supabase
          .from('parent_profiles')
          .select('id, full_name, avatar_url')
          .eq('id', childData.parent_id)
          .single();
        if (parentData) setContacts([{ id: parentData.id, name: parentData.full_name, avatar_url: parentData.avatar_url }]);
      }
    }
  };

  const loadUnreadCounts = async () => {
    const { data } = await supabase
      .from('messages')
      .select('sender_id')
      .eq('receiver_id', currentUserId)
      .eq('is_read', false);

    if (data) {
      const counts: Record<string, number> = {};
      data.forEach(msg => {
        counts[msg.sender_id] = (counts[msg.sender_id] || 0) + 1;
      });
      setUnreadCounts(counts);
    }
  };

  const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative">
          <MessageSquare className="w-5 h-5" />
          {totalUnread > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
              {totalUnread}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:w-[600px] p-0">
        <div className="flex h-full">
          <div className="w-1/3 border-r bg-gray-50">
            <SheetHeader className="p-4 border-b bg-white">
              <SheetTitle>Messages</SheetTitle>
            </SheetHeader>
            <div className="overflow-y-auto h-[calc(100vh-80px)]">
              {contacts.map(contact => (
                <button key={contact.id} onClick={() => setSelectedContact(contact)} className={`w-full p-4 flex items-center gap-3 hover:bg-gray-100 transition-colors ${selectedContact?.id === contact.id ? 'bg-blue-50' : ''}`}>
                  <Avatar>
                    <AvatarImage src={contact.avatar_url} />
                    <AvatarFallback>{contact.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-sm">{contact.name}</p>
                    {unreadCounts[contact.id] > 0 && (
                      <Badge variant="default" className="mt-1">{unreadCounts[contact.id]} new</Badge>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1">
            {selectedContact ? (
              <ChatInterface currentUserId={currentUserId} otherUserId={selectedContact.id} otherUserName={selectedContact.name} otherUserAvatar={selectedContact.avatar_url} userRole={userRole} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <p>Select a contact to start messaging</p>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
