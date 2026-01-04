import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { IoSend, IoArrowBack } from 'react-icons/io5';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { useTranslation } from 'react-i18next';

// Styled Components
const PageContainer = styled.div`
  min-height: 100vh;
  background: #fafbfc;
  width: 100%;
`;

const Container = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: white;
`;

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

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 32px;
  background: #fafbfc;
  min-height: 0;
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

const MessagesWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const MessageWrapper = styled.div`
  display: flex;
  flex-direction: ${props => props.$isUser ? 'row-reverse' : 'row'};
  align-items: flex-end;
  gap: 12px;
  align-self: ${props => props.$isUser ? 'flex-end' : 'flex-start'};
  max-width: 65%;
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
  flex-shrink: 0;
`;

const MessageContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
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
  word-wrap: break-word;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  }
`;

const MessageTime = styled.div`
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
  font-family: 'Raleway', sans-serif;
  font-weight: 500;
  text-align: ${props => props.$isUser ? 'right' : 'left'};
  padding: 0 6px;
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
  flex-shrink: 0;
  
  &:hover:not(:disabled) {
    transform: scale(1.1);
    box-shadow: 0 6px 20px rgba(0, 188, 125, 0.4);
  }
  
  &:active:not(:disabled) {
    transform: scale(0.95);
  }
`;

const EmptyState = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  text-align: center;
  color: #666;
  font-family: 'Raleway', sans-serif;
  font-size: 16px;
  font-weight: 500;
`;

const LoadingState = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-family: 'Raleway', sans-serif;
  font-size: 18px;
  font-weight: 600;
  color: #00BC7D;
`;

const ErrorState = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-family: 'Raleway', sans-serif;
  color: #e74c3c;
  gap: 12px;
  padding: 20px;
  text-align: center;
`;

const ErrorButton = styled.button`
  padding: 12px 24px;
  background: #00BC7D;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-family: 'Raleway', sans-serif;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 188, 125, 0.3);
  }
`;

const CustomerMessages = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const messagesEndRef = useRef(null);
  const lastSentMessageRef = useRef(null);
  const [storedVendorId, setStoredVendorId] = useState(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Get vendorId from URL params
  useEffect(() => {
    const vendorId = searchParams.get('vendorId');
    console.log('📍 URL vendorId:', vendorId);
    console.log('📍 Profile:', profile);
    
    if (vendorId && !storedVendorId) {
      console.log('✅ Setting vendorId:', vendorId);
      setStoredVendorId(vendorId);
    } else if (!vendorId) {
      console.error('❌ No vendorId in URL params');
      setError(t('NoVendorId'));
      setLoading(false);
    }
  }, [searchParams, storedVendorId, t]);

  // Fetch or create conversation
  useEffect(() => {
    if (storedVendorId && !conversationId && profile?.id) {
      console.log('🔄 Fetching conversation - Customer:', profile.id, 'Vendor:', storedVendorId);
      fetchOrCreateConversation();
    }
  }, [storedVendorId, conversationId, profile?.id]);

  // Real-time subscription
  useEffect(() => {
    if (selectedConversation && profile?.id) {
      console.log('🔔 Setting up real-time subscription for conversation:', selectedConversation.id);
      
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
            console.log('📨 New message received:', payload);
            
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
              console.log('⏭️ Skipping duplicate message');
              lastSentMessageRef.current = null;
              return;
            }

            setMessages((prev) => [...prev, newMessage]);
            setTimeout(scrollToBottom, 100);
          }
        )
        .subscribe();

      return () => {
        console.log('🔕 Cleaning up subscription');
        supabase.removeChannel(msgChannel);
      };
    }
  }, [selectedConversation, profile?.id]);

  const fetchOrCreateConversation = async () => {
    if (!profile?.id) {
      console.error('❌ Profile ID is undefined');
      setError(t('UserProfileMissing'));
      setLoading(false);
      return;
    }
    if (!storedVendorId) {
      console.error('❌ No vendorId provided');
      setError(t('NoVendorId'));
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Checking for existing conversation...');
      const { data: existingConv, error: convError } = await supabase
        .from('conversations')
        .select('id, vendor_id, customer_id, created_at')
        .eq('vendor_id', storedVendorId)
        .eq('customer_id', profile.id)
        .maybeSingle();

      let convId = existingConv?.id;

      if (convError && convError.code !== 'PGRST116') {
        console.error('❌ Error checking conversation:', convError);
        throw convError;
      }

      if (!convId) {
        console.log('➕ Creating new conversation');
        const { data: newConv, error: newConvError } = await supabase
          .from('conversations')
          .insert({
            vendor_id: storedVendorId,
            customer_id: profile.id,
          })
          .select()
          .single();

        if (newConvError) {
          console.error('❌ Error creating conversation:', newConvError);
          throw newConvError;
        }
        convId = newConv.id;
        console.log('✅ New conversation created:', convId);
      } else {
        console.log('✅ Existing conversation found:', convId);
      }

      setConversationId(convId);

      console.log('👤 Fetching vendor profile...');
      const { data: vendorProfile, error: profileError } = await supabase
        .from('profiles')
        .select('first_name, last_name, avatar_url')
        .eq('id', storedVendorId)
        .single();

      if (profileError) {
        console.error('❌ Error fetching vendor profile:', profileError);
        throw profileError;
      }

      const vendorName = `${vendorProfile.first_name} ${vendorProfile.last_name}`;
      console.log('✅ Vendor name:', vendorName);

      setSelectedConversation({
        id: convId,
        other_party_id: storedVendorId,
        other_party_name: vendorName,
        other_party_avatar: vendorProfile.avatar_url || 'https://via.placeholder.com/40',
        last_message: t('StartYourConversation'),
        last_message_time: new Date().toISOString(),
      });

      console.log('💬 Loading messages...');
      const { data: fetchedMessages, error: msgError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true });

      if (msgError) {
        console.error('❌ Error loading messages:', msgError);
        throw msgError;
      }

      console.log(`✅ Loaded ${fetchedMessages?.length || 0} messages`);
      setMessages(
        fetchedMessages.map((msg) => ({
          id: msg.id.toString(),
          text: msg.content,
          isUser: msg.sender_id === profile.id,
          created_at: msg.created_at,
        }))
      );
    } catch (error) {
      console.error('❌ Fatal error in fetchOrCreateConversation:', error);
      setError(error.message || t('FailedToLoadOrderDetails'));
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!query.trim() || !conversationId || loading) {
      console.log('⚠️ Cannot send message:', { query: query.trim(), conversationId, loading });
      return;
    }

    setLoading(true);
    const tempId = Date.now().toString();

    const optimisticMessage = {
      id: tempId,
      text: query,
      isUser: true,
      created_at: new Date().toISOString(),
    };

    console.log('📤 Sending message:', query);
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

      if (error) {
        console.error('❌ Error sending message:', error);
        throw error;
      }

      const realId = data.id.toString();
      console.log('✅ Message sent with ID:', realId);
      
      lastSentMessageRef.current = {
        id: realId,
        text: query,
        senderId: profile.id,
        created_at: optimisticMessage.created_at,
      };

      setMessages((prev) =>
        prev.map((msg) => (msg.id === tempId ? { ...msg, id: realId } : msg))
      );

      setQuery('');
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
      alert(t('FailedToSendMessage'));
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = (message) => {
    const isUser = message.isUser;
    const avatarUrl = isUser
      ? profile?.avatar_url || 'https://via.placeholder.com/40'
      : selectedConversation?.other_party_avatar || 'https://via.placeholder.com/40';

    return (
      <MessageWrapper key={message.id} $isUser={isUser}>
        <MessageAvatar src={avatarUrl} alt="Avatar" />
        <MessageContent>
          <MessageBubble $isUser={isUser}>{message.text}</MessageBubble>
          <MessageTime $isUser={isUser}>
            {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </MessageTime>
        </MessageContent>
      </MessageWrapper>
    );
  };

  // Error state
  if (error) {
    return (
      <ErrorState>
        <div style={{ fontSize: '48px' }}>⚠️</div>
        <h2>{t('Error')}</h2>
        <p>{error}</p>
        <ErrorButton onClick={() => navigate(-1)}>
          {t('GoBack')}
        </ErrorButton>
      </ErrorState>
    );
  }

  // Loading state - Simplified
  if (loading && !selectedConversation) {
    return (
      <LoadingState>
        {t('Loading')}
      </LoadingState>
    );
  }

  // No conversation state
  if (!selectedConversation) {
    return (
      <ErrorState>
        <div style={{ fontSize: '48px' }}>📭</div>
        <h2>{t('NoConversationsYet')}</h2>
        <p>{t('FailedToLoadOrderDetails')}</p>
        <ErrorButton onClick={() => navigate(-1)}>
          {t('GoBack')}
        </ErrorButton>
      </ErrorState>
    );
  }

  return (
    <PageContainer>
      <Container>
        <ChatContainer>
          <ChatHeader>
            <BackButton onClick={() => navigate(-1)}>
              <IoArrowBack />
            </BackButton>
            <CircleContainer>
              <InnerCircle>
                <HeaderIcon 
                  src={selectedConversation.other_party_avatar} 
                  alt={selectedConversation.other_party_name}
                  onError={(e) => e.target.src = 'https://via.placeholder.com/40'}
                />
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
              <MessagesWrapper>
                {messages.map(renderMessage)}
                <div ref={messagesEndRef} />
              </MessagesWrapper>
            )}
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

export default CustomerMessages;