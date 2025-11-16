import { useState, useRef } from 'react';
import { Send, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TaggedInput } from '@/components/ai/TaggedInput';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { useTags } from '@/lib/query';
import { formatRelativeDate, generateId, cn } from '@/lib/utils';
import type { Tag } from '@/lib/types';

interface Comment {
  id: string;
  author: string;
  content: string;
  mentionedTags: Tag[];
  timestamp: Date;
}

interface CommentThreadProps {
  comments: Comment[];
  onAddComment: (comment: Comment) => void;
  onTagClick: (tagId: string) => void;
}

export function CommentThread({ comments, onAddComment, onTagClick }: CommentThreadProps) {
  const [input, setInput] = useState('');
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: tagsData } = useTags();
  const allTags = tagsData?.items || [];

  const filteredTags = allTags.filter((tag) =>
    tag.label.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  const handleInputChange = (value: string) => {
    setInput(value);

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
    if (!selectedTags.find((t) => t.id === tag.id)) {
      setSelectedTags([...selectedTags, tag]);
    }

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

  const handleSubmit = () => {
    if (!input.trim() && selectedTags.length === 0) return;

    const newComment: Comment = {
      id: generateId('comment'),
      author: 'Liam Trampota', // In real app, get from auth
      content: input,
      mentionedTags: selectedTags,
      timestamp: new Date(),
    };

    onAddComment(newComment);
    setInput('');
    setSelectedTags([]);
  };

  return (
    <div className="space-y-4">
      {/* Comments */}
      {comments.map((comment) => (
        <Card key={comment.id}>
          <CardContent className="p-3 space-y-2">
            <div className="flex items-center gap-2">
              <UserIcon className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-sm">{comment.author}</span>
              <span className="text-xs text-muted-foreground">
                {formatRelativeDate(comment.timestamp)}
              </span>
            </div>
            <p className="text-sm whitespace-pre-wrap">
              {comment.mentionedTags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => onTagClick(tag.entityId!)}
                  className="text-primary hover:underline font-medium"
                >
                  {tag.label}{' '}
                </button>
              ))}
              {comment.content}
            </p>
          </CardContent>
        </Card>
      ))}

      {comments.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">
          No comments yet. Add the first one!
        </p>
      )}

      {/* Input */}
      <div className="relative">
        {/* Tag Mention Dropdown */}
        {showMentions && filteredTags.length > 0 && (
          <div className="absolute bottom-full left-0 right-0 mb-2">
            <Card className="shadow-xl border-2">
              <CardContent className="p-2">
                <Command>
                  <CommandList className="max-h-[150px]">
                    <CommandEmpty>No tags found.</CommandEmpty>
                    <CommandGroup>
                      {filteredTags.slice(0, 6).map((tag) => (
                        <CommandItem key={tag.id} onSelect={() => handleSelectTag(tag)}>
                          <span className={cn(tag.kind === 'entity' && 'text-primary font-medium')}>
                            {tag.label}
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
            handleSubmit();
          }}
          className="flex items-center gap-2"
        >
          <TaggedInput
            value={input}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setShowMentions(false);
            }}
            selectedTags={selectedTags}
            onRemoveTag={handleRemoveTag}
            placeholder="Add a comment... Type @ to mention"
            inputRef={inputRef}
          />
          <Button type="submit" size="icon" disabled={!input.trim() && selectedTags.length === 0}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
