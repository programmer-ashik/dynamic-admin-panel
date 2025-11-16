import { useState, useRef, useEffect } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import { Sparkles, Send, X, Info, Trash2, Hash, User, Plus, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { TaggedInput } from './TaggedInput';
import { ContextSelector } from './ContextSelector';
import { useUIStore, type AIConversation, type AIMessage } from '@/lib/store';
import { useCollections, useObjects, useTags, useObject } from '@/lib/query';
import { cn, generateId, formatRelativeDate } from '@/lib/utils';
import type { FilterGroup, Tag } from '@/lib/types';

interface AIPaneProps {
  currentFilter?: FilterGroup;
  isFullPage?: boolean;
}

export function AIPane({ currentFilter, isFullPage = false }: AIPaneProps) {
  const navigate = useNavigate();
  const { wsId = 'ws_default' } = useParams();
  const [searchParams] = useSearchParams();
  const aiPaneOpen = useUIStore((state) => state.aiPaneOpen);
  const setAiPaneOpen = useUIStore((state) => state.setAiPaneOpen);
  const selectedObjectId = useUIStore((state) => state.selectedObjectId);
  const aiConversations = useUIStore((state) => state.aiConversations);
  const currentConversationId = useUIStore((state) => state.currentConversationId);
  const setCurrentConversationId = useUIStore((state) => state.setCurrentConversationId);
  const addConversation = useUIStore((state) => state.addConversation);
  const updateConversation = useUIStore((state) => state.updateConversation);
  const deleteConversation = useUIStore((state) => state.deleteConversation);

  const { data: collectionsData } = useCollections();
  const { data: objectsData } = useObjects();
  const { data: tagsData } = useTags();
  const { data: selectedObjData } = useObject(selectedObjectId || '');

  const [input, setInput] = useState('');
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [showContextSelector, setShowContextSelector] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentConversation = aiConversations.find((c) => c.id === currentConversationId);
  const messages = currentConversation?.messages || [];

  const collections = collectionsData?.items || [];
  const allObjects = objectsData?.items || [];
  const allTags = tagsData?.items || [];
  const selectedObject = selectedObjData?.item;

  const collectionId = searchParams.get('collectionId');
  const currentCollection = collections.find((c) => c.id === collectionId);
  const tagSlugs = searchParams.get('tagSlugs')?.split(',').filter(Boolean) || [];

  // Filter tags for mentions
  const filteredTags = allTags.filter((tag) =>
    tag.label.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages]);

  const getContextSummary = () => {
    const parts = [];

    if (currentCollection) {
      parts.push(`Collection: ${currentCollection.name}`);
    }

    if (tagSlugs.length > 0) {
      parts.push(`Tags: ${tagSlugs.join(', ')}`);
    }

    if (currentFilter && currentFilter.conditions.length > 0) {
      parts.push(`${currentFilter.conditions.length} active filter(s)`);
    }

    if (selectedObject) {
      parts.push(`Viewing: ${selectedObject.title}`);
    }

    return parts.join(' • ');
  };

  const handleInputChange = (value: string) => {
    setInput(value);

    // Detect @ mention
    if (value.endsWith('@')) {
      setShowMentions(true);
      setMentionQuery('');
    } else if (showMentions && value.includes('@')) {
      const lastAtIndex = value.lastIndexOf('@');
      const query = value.substring(lastAtIndex + 1);
      if (!query.includes(' ')) {
        setMentionQuery(query);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  const handleSelectTag = (tag: Tag) => {
    // Add tag to selected tags instead of inline
    if (!selectedTags.find((t) => t.id === tag.id)) {
      setSelectedTags([...selectedTags, tag]);
    }

    // Remove the @ and query from input
    const lastAtIndex = input.lastIndexOf('@');
    if (lastAtIndex !== -1) {
      setInput(input.substring(0, lastAtIndex));
    }

    setShowMentions(false);
    inputRef.current?.focus();
  };

  const handleRemoveTag = (tagId: string) => {
    setSelectedTags(selectedTags.filter((t) => t.id !== tagId));
  };

  const handleSend = async () => {
    if (!input.trim() && selectedTags.length === 0) return;

    // Construct message with tags
    const tagMentions = selectedTags.map((t) => t.label).join(' ');
    const fullMessage = selectedTags.length > 0 ? `${tagMentions} ${input}`.trim() : input;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: fullMessage,
      timestamp: new Date(),
    };

    if (!currentConversationId) {
      const newConversation: AIConversation = {
        id: generateId('conv'),
        title: input.substring(0, 50) + (input.length > 50 ? '...' : ''),
        messages: [userMessage],
        context: {
          collectionId: collectionId || undefined,
          tagSlugs: tagSlugs.length > 0 ? tagSlugs : undefined,
          selectedObjectId: selectedObjectId || undefined,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      addConversation(newConversation);
    } else {
      const updatedMessages = [...messages, userMessage];
      updateConversation(currentConversationId, { messages: updatedMessages });
    }

    setInput('');
    setSelectedTags([]);
    setShowMentions(false);
    setIsLoading(true);

    setTimeout(() => {
      const context = getContextSummary();
      const assistantMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I'm analyzing your question in the context of: ${context || 'your entire workspace'}.\n\nThis is a mock AI response. In a production app, this would:\n\n1. Use the current context (collection, filters, selected objects)\n2. Query a vector database with your documents\n3. Generate contextual answers using an LLM\n4. Reference specific objects and tags\n\nYour question: "${input}"`,
        timestamp: new Date(),
      };

      if (currentConversationId) {
        const updatedMessages = [...messages, userMessage, assistantMessage];
        updateConversation(currentConversationId, { messages: updatedMessages });
      }
      setIsLoading(false);
    }, 1000);
  };

  const startNewConversation = () => {
    setCurrentConversationId(null);
  };

  // When opening AI pane, default to conversations view if there are conversations
  useEffect(() => {
    if (aiPaneOpen && aiConversations.length > 0 && !currentConversationId) {
      // Don't auto-select, show list
    }
  }, [aiPaneOpen]);

  if (!isFullPage && !aiPaneOpen) return null;

  return (
    <div className="h-full border-l bg-card flex flex-col min-h-0">
      {/* Header */}
      <div className="flex-none border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">AI Assistant</h3>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => {
                navigate(`/w/${wsId}/ai`);
                setAiPaneOpen(false); // Close side pane when going full page
              }}
              title="Open full page"
            >
              <Maximize2 className="h-3 w-3" />
            </Button>
            {currentConversationId && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={startNewConversation}
                title="New conversation"
              >
                <Plus className="h-3 w-3" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setAiPaneOpen(false)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Context info */}
        {getContextSummary() && (
          <div className="flex items-start gap-2 p-2 bg-primary/5 border border-primary/20 rounded-md mt-3">
            <Info className="h-3 w-3 text-primary mt-0.5 shrink-0" />
            <div className="text-xs text-muted-foreground flex-1 min-w-0">
              <div className="font-medium text-foreground mb-1">Current Context</div>
              <div className="break-words">{getContextSummary()}</div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs"
              onClick={() => setShowContextSelector(true)}
              disabled={!currentConversationId}
            >
              Change
            </Button>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            {/* Conversation History (when no active conversation) */}
            {!currentConversationId && aiConversations.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-3">
                  Recent Conversations
                </h4>
                {aiConversations.map((conversation) => (
                  <Card
                    key={conversation.id}
                    className="cursor-pointer hover:bg-accent/50 transition-colors group"
                    onClick={() => setCurrentConversationId(conversation.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{conversation.title}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {conversation.messages.length} messages •{' '}
                            {formatRelativeDate(conversation.updatedAt)}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('Delete this conversation?')) {
                              deleteConversation(conversation.id);
                            }
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Active Conversation Messages */}
            {currentConversationId && (
              <>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={message.role === 'user' ? 'flex justify-end' : 'flex justify-start'}
                  >
                    <Card
                      className={
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground max-w-[80%]'
                          : 'bg-muted max-w-[85%]'
                      }
                    >
                      <CardContent className="p-3">
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <p className="text-xs opacity-70 mt-2">
                          {new Date(message.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <Card className="bg-muted max-w-[85%]">
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 animate-pulse text-primary" />
                          <p className="text-sm text-muted-foreground">Thinking...</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </>
            )}

            {/* Empty State */}
            {!currentConversationId && aiConversations.length === 0 && (
              <div className="text-center py-12 space-y-3">
                <Sparkles className="h-12 w-12 text-muted-foreground mx-auto" />
                <div>
                  <h4 className="font-medium">Ask me anything</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Start a conversation by typing a message below
                  </p>
                </div>
              </div>
            )}

            <div ref={scrollRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Input Area - Fixed height to prevent cropping */}
      <div
        className="flex-none border-t px-4 pt-4 bg-card"
        style={{ minHeight: '140px', paddingBottom: '16px' }}
      >
        <div className="relative">
          {/* Tag Mention Dropdown */}
          {showMentions && filteredTags.length > 0 && (
            <div className="absolute bottom-full left-0 right-0 mb-2">
              <Card className="shadow-xl border-2">
                <CardContent className="p-2">
                  <Command>
                    <CommandList className="max-h-[200px]">
                      <CommandEmpty>No tags found.</CommandEmpty>
                      <CommandGroup heading="Mention Tags">
                        {filteredTags.slice(0, 8).map((tag) => (
                          <CommandItem key={tag.id} onSelect={() => handleSelectTag(tag)}>
                            {tag.kind === 'entity' ? (
                              <User className="mr-2 h-3 w-3 text-primary" />
                            ) : (
                              <Hash className="mr-2 h-3 w-3 text-muted-foreground" />
                            )}
                            <span className={cn(tag.kind === 'entity' && 'text-primary')}>
                              {tag.label}
                            </span>
                            <span className="ml-auto text-xs text-muted-foreground capitalize">
                              {tag.kind}
                            </span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </CardContent>
              </Card>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2">
              <TaggedInput
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setShowMentions(false);
                  }
                }}
                selectedTags={selectedTags}
                onRemoveTag={handleRemoveTag}
                placeholder="Ask a question... Type @ to mention tags"
                disabled={isLoading}
                inputRef={inputRef}
              />
              <Button
                type="submit"
                size="icon"
                disabled={(!input.trim() && selectedTags.length === 0) || isLoading}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Press Enter to send • Type{' '}
              <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">@</kbd> to mention tags
            </p>
          </form>
        </div>
      </div>

      {/* Context Selector */}
      {showContextSelector && currentConversationId && (
        <ContextSelector
          open={showContextSelector}
          onClose={() => setShowContextSelector(false)}
          currentContext={currentConversation?.context}
          onUpdate={(newContext) => {
            if (currentConversationId) {
              updateConversation(currentConversationId, { context: newContext });
            }
          }}
        />
      )}
    </div>
  );
}
