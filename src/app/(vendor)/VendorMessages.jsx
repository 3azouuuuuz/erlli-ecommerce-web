import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { IoSend, IoArrowBack } from 'react-icons/io5';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/constants';
import VendorHeader from '../../components/VendorHeader';
import { useTranslation } from 'react-i18next';

// Styled Components
const PageContainer = styled.div`
  min-height: 100vh;
  background: #fafbfc;
  padding-top: 74px;
`;

const Container = styled.div`
  width: 100%;
  height: calc(100vh - 74px);
  display: flex;
  flex-direction: column;
  background: white;
`;

// Conversation List Styles
const ConversationListContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #00BC7D;
    border-radius: 4px;
  }
`;

const ConversationHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 24px 32px;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-bottom: 2px solid #E4E4E74D;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  
  @media (max-width: 768px) {
    padding: 20px 16px;
  }
`;

const CircleContainer = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-right: 16px;
  
  @media (max-width: 768px) {
    width: 50px;
    height: 50px;
  }
`;

const InnerCircle = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #D0FAE5;
  display: flex;
  justify-content: center;
  align-items: center;
  
  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
  }
`;

const HeaderIcon = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  
  @media (max-width: 768px) {
    width: 32px;
    height: 32px;
  }
`;

const HeaderInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const HeaderTitle = styled.h1`
  font-size: 20px;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  color: #00BC7D;
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 18px;
  }
`;

const HeaderSubtitle = styled.p`
  font-size: 14px;
  font-weight: 600;
  font-family: 'Raleway', sans-serif;
  color: #202020;
  margin: 0;
`;

const ConversationList = styled.div`
  padding: 16px 32px;
  
  @media (max-width: 768px) {
    padding: 12px 16px;
  }
`;

const ConversationItem = styled.div`
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #E4E4E74D;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 8px;
  
  &:hover {
    background: #F8F9FA;
    transform: translateX(4px);
  }
`;

const ConversationAvatar = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const ConversationInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ConversationName = styled.div`
  font-size: 16px;
  font-weight: 600;
  font-family: 'Raleway', sans-serif;
  color: #202020;
`;

const ConversationLastMessage = styled.div`
  font-size: 14px;
  font-family: 'Raleway', sans-serif;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const TimeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

const ConversationTime = styled.div`
  font-size: 12px;
  font-family: 'Raleway', sans-serif;
  color: #666;
  margin-bottom: 4px;
`;

const EmptyState = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 80px 20px;
  text-align: center;
  color: #666;
  font-family: 'Raleway', sans-serif;
  font-size: 16px;
  font-weight: 500;
`;

// Chat View Styles
const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const ChatHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 24px 32px;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-bottom: 2px solid #E4E4E74D;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  
  @media (max-width: 768px) {
    padding: 20px 16px;
  }
`;

const BackButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: #D0FAE5;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-right: 16px;
  
  svg {
    font-size: 20px;
    color: #00BC7D;
  }
  
  &:hover {
    background: #00BC7D;
    
    svg {
      color: white;
    }
  }
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 32px;
  background: #fafbfc;
  display: flex;
  flex-direction: column;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #00BC7D;
    border-radius: 4px;
  }
  
  @media (max-width: 768px) {
    padding: 20px 16px;
  }
`;

const MessageWrapper = styled.div`
  display: flex;
  flex-direction: ${props => props.$isUser ? 'row-reverse' : 'row'};
  align-items: flex-end;
  gap: 12px;
  margin-bottom: 20px;
  align-self: ${props => props.$isUser ? 'flex-end' : 'flex-start'};
  max-width: 65%;
  width: fit-content;
  animation: slideIn 0.3s ease-out;
  
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @media (max-width: 1024px) {
    max-width: 75%;
  }
  
  @media (max-width: 768px) {
    max-width: 85%;
  }
`;

const MessageAvatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const MessageBubble = styled.div`
  padding: 14px 18px;
  border-radius: ${props => props.$isUser ? '20px 20px 4px 20px' : '20px 20px 20px 4px'};
  background: ${props => props.$isUser ? '#D0FAE5' : '#F0F0F0'};
  color: #000000;
  font-family: 'Raleway', sans-serif;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.5;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  }
`;

const MessageTime = styled.div`
  font-size: 12px;
  color: rgba(0, 0, 0, 0.7);
  margin-top: 4px;
  text-align: ${props => props.$isUser ? 'right' : 'left'};
`;

const InputContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 24px 32px;
  background: #D0FAE5;
  border-top: 1px solid #E4E4E74D;
  gap: 16px;
  
  @media (max-width: 768px) {
    padding: 16px 20px;
    gap: 12px;
  }
`;

const Input = styled.input`
  flex: 1;
  padding: 14px 20px;
  background: white;
  border: 2px solid transparent;
  border-radius: 20px;
  font-family: 'Raleway', sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: #000;
  outline: none;
  transition: all 0.3s ease;
  
  &:focus {
    border-color: #00BC7D;
    box-shadow: 0 4px 12px rgba(0, 188, 125, 0.2);
  }
  
  &::placeholder {
    color: rgba(0, 0, 0, 0.4);
  }
  
  @media (max-width: 768px) {
    padding: 12px 16px;
    font-size: 14px;
  }
`;

const SendButton = styled.button`
  width: 48px;
  height: 48px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: ${props => props.disabled ? '#ccc' : '#00BC7D'};
  border: none;
  border-radius: 50%;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  color: white;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 188, 125, 0.3);
  
  &:hover:not(:disabled) {
    transform: scale(1.1);
    box-shadow: 0 6px 20px rgba(0, 188, 125, 0.4);
  }
  
  &:active:not(:disabled) {
    transform: scale(0.95);
  }
`;

const VendorMessages = () => {
  const { profile } = useAuth();
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversations, setConversations] = useState([]);
  const messagesEndRef = useRef(null);
  const lastSentMessageRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch conversations with last message
  const fetchConversations = async () => {
    if (!profile?.id) return;
    
    try {
      const { data: convData, error: convError } = await supabase
        .from('conversations')
        .select(`
          id,
          vendor_id,
          customer_id,
          created_at,
          profiles!conversations_customer_id_fkey (first_name, last_name, avatar_url)
        `)
        .or(`vendor_id.eq.${profile.id},customer_id.eq.${profile.id}`);

      if (convError) {
        console.error('Error fetching conversations:', convError);
        throw convError;
      }

      if (!convData || convData.length === 0) {
        setConversations([]);
        return;
      }

      const conversationsWithLastMessage = await Promise.all(
        convData.map(async (conv) => {
          const { data: messagesData, error: messageError } = await supabase
            .from('messages')
            .select('content, created_at, sender_id')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1);

          const lastMessage = messagesData && messagesData.length > 0 ? messagesData[0] : null;

          if (messageError && messageError.code !== 'PGRST116') {
            console.error(`Error fetching last message for conversation ${conv.id}:`, messageError);
          }

          const isVendor = profile.role === 'vendor';
          const otherPartyName = isVendor
            ? `${conv.profiles.first_name} ${conv.profiles.last_name}`
            : t('Vendor');

          return {
            id: conv.id,
            other_party_id: isVendor ? conv.customer_id : conv.vendor_id,
            other_party_name: otherPartyName,
            other_party_avatar: conv.profiles?.avatar_url || 'https://via.placeholder.com/40',
            last_message: lastMessage?.content || t('NoMessagesYet'),
            last_message_time: lastMessage?.created_at || conv.created_at,
          };
        })
      );

      conversationsWithLastMessage.sort((a, b) => 
        new Date(b.last_message_time) - new Date(a.last_message_time)
      );

      setConversations(conversationsWithLastMessage);
    } catch (error) {
      console.error('Error in fetchConversations:', error);
    }
  };

  // Initial load and realtime for conversations
  useEffect(() => {
    fetchConversations();

    const convChannel = supabase
      .channel('conversations_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `vendor_id=eq.${profile?.id}`,
        },
        () => fetchConversations()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(convChannel);
    };
  }, [profile?.id]);

  // Handle selected conversation
  useEffect(() => {
    if (!selectedConversation || !profile?.id) return;

    const loadMessages = async () => {
      setConversationId(selectedConversation.id);
      
      const { data: fetchedMessages, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', selectedConversation.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading messages:', error);
        return;
      }

      setMessages(
        fetchedMessages.map((msg) => ({
          id: msg.id.toString(),
          text: msg.content,
          isUser: msg.sender_id === profile.id,
          created_at: msg.created_at,
        }))
      );
    };

    loadMessages();

    const msgChannel = supabase
      .channel(`messages_${selectedConversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${selectedConversation.id}`,
        },
        async (payload) => {
          const newMessage = {
            id: payload.new.id.toString(),
            text: payload.new.content,
            isUser: payload.new.sender_id === profile.id,
            created_at: payload.new.created_at,
          };

          const lastSent = lastSentMessageRef.current;
          if (
            lastSent &&
            lastSent.text === newMessage.text &&
            lastSent.senderId === profile.id &&
            lastSent.id === newMessage.id
          ) {
            lastSentMessageRef.current = null;
            return;
          }

          setMessages((prev) => [...prev, newMessage]);

          setConversations((prev) =>
            prev.map((c) =>
              c.id === selectedConversation.id
                ? {
                    ...c,
                    last_message: newMessage.text,
                    last_message_time: newMessage.created_at,
                  }
                : c
            ).sort((a, b) => new Date(b.last_message_time) - new Date(a.last_message_time))
          );

          setTimeout(scrollToBottom, 100);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(msgChannel);
    };
  }, [selectedConversation, profile?.id]);

  const handleSendMessage = async () => {
    if (!query.trim() || !conversationId || loading) return;

    setLoading(true);
    const tempId = Date.now().toString();

    const optimisticMessage = {
      id: tempId,
      text: query,
      isUser: true,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: profile.id,
          content: query,
        })
        .select()
        .single();

      if (error) throw error;

      const realId = data.id.toString();
      lastSentMessageRef.current = {
        id: realId,
        text: query,
        senderId: profile.id,
        created_at: optimisticMessage.created_at,
      };

      setMessages((prev) =>
        prev.map((msg) => (msg.id === tempId ? { ...msg, id: realId } : msg))
      );

      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId
            ? {
                ...c,
                last_message: query,
                last_message_time: new Date().toISOString(),
              }
            : c
        ).sort((a, b) => new Date(b.last_message_time) - new Date(a.last_message_time))
      );

      setQuery('');
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    const messageTime = new Date(timestamp);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const isToday = messageTime >= today;
    
    if (isToday) {
      return messageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return messageTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const renderConversation = (conv) => (
    <ConversationItem key={conv.id} onClick={() => setSelectedConversation(conv)}>
      <ConversationAvatar src={conv.other_party_avatar} alt={conv.other_party_name} />
      <ConversationInfo>
        <ConversationName>{conv.other_party_name}</ConversationName>
        <ConversationLastMessage>{conv.last_message}</ConversationLastMessage>
      </ConversationInfo>
      <TimeContainer>
        <ConversationTime>{formatTime(conv.last_message_time)}</ConversationTime>
      </TimeContainer>
    </ConversationItem>
  );

  const renderMessage = (message) => {
    const isUser = message.isUser;
    const avatarUrl = isUser
      ? profile?.avatar_url || 'https://via.placeholder.com/40'
      : selectedConversation?.other_party_avatar || 'https://via.placeholder.com/40';

    return (
      <MessageWrapper key={message.id} $isUser={isUser}>
        <MessageAvatar src={avatarUrl} alt="Avatar" />
        <div>
          <MessageBubble $isUser={isUser}>{message.text}</MessageBubble>
          <MessageTime $isUser={isUser}>
            {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </MessageTime>
        </div>
      </MessageWrapper>
    );
  };

  if (!selectedConversation) {
    return (
      <PageContainer>
        <VendorHeader profile={profile} />
        <Container>
          <ConversationHeader>
            <CircleContainer>
              <InnerCircle>
                <HeaderIcon src={profile?.avatar_url || 'https://via.placeholder.com/40'} alt={t('Profile')} />
              </InnerCircle>
            </CircleContainer>
            <HeaderInfo>
              <HeaderTitle>{profile?.first_name || t('Vendor')}</HeaderTitle>
              <HeaderSubtitle>{t('Messages')}</HeaderSubtitle>
            </HeaderInfo>
          </ConversationHeader>

          <ConversationListContainer>
            <ConversationList>
              {conversations.length === 0 ? (
                <EmptyState>{t('NoConversationsYet')}</EmptyState>
              ) : (
                conversations.map(renderConversation)
              )}
            </ConversationList>
          </ConversationListContainer>
        </Container>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <VendorHeader profile={profile} />
      <Container>
        <ChatContainer>
          <ChatHeader>
            <BackButton onClick={() => setSelectedConversation(null)}>
              <IoArrowBack />
            </BackButton>
            <CircleContainer>
              <InnerCircle>
                <HeaderIcon src={selectedConversation.other_party_avatar} alt={selectedConversation.other_party_name} />
              </InnerCircle>
            </CircleContainer>
            <HeaderInfo>
              <HeaderTitle>{selectedConversation.other_party_name}</HeaderTitle>
              <HeaderSubtitle>{t('Messaging')}</HeaderSubtitle>
            </HeaderInfo>
          </ChatHeader>

          <MessagesContainer>
            {messages.length === 0 ? (
              <EmptyState>{t('StartYourConversation')}</EmptyState>
            ) : (
              messages.map(renderMessage)
            )}
            <div ref={messagesEndRef} />
          </MessagesContainer>

          <InputContainer>
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={t('TypeYourMessage')}
              disabled={loading}
            />
            <SendButton onClick={handleSendMessage} disabled={loading || !query.trim()}>
              <IoSend size={20} />
            </SendButton>
          </InputContainer>
        </ChatContainer>
      </Container>
    </PageContainer>
  );
};

export default VendorMessages;