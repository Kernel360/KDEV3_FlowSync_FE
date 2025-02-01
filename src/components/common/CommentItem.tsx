// 외부 라이브러리
import { useState, useRef, useEffect } from "react";
import {
  Box,
  Button,
  Text,
  Textarea,
  Flex,
  IconButton,
} from "@chakra-ui/react";

// 절대 경로 파일
import { ArticleComment } from "@/src/types";


interface CommentProps {
  comment: ArticleComment;
  replies?: ArticleComment[];
}

export default function CommentItem({ comment, replies = [] }: CommentProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [openOptionId, setOpenOptionId] = useState<number | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // 드롭다운 외부를 클릭하면 닫기
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpenOptionId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleOption = (id: number) => {
    setOpenOptionId((prev) => (prev === id ? null : id));
  };

  const handleEdit = (id: number) => {
    // 수정 로직 추가
  };

  const handleDelete = (id: number) => {
    // 삭제 로직 추가
  };


  return (
    <Box mt={2} pl={comment.parentId ? 4 : 0} borderLeftWidth={comment.parentId ? 1 : 0} borderColor={"gray.200"}>
      {/* 댓글 본문 */}
      <Flex justifyContent="space-between" alignItems="center">
        <Text>{comment.content}</Text>
        <Box ref={dropdownRef}>
          <IconButton
            size="xs"
            aria-label="댓글 옵션"
            // icon={<LuMoreVertical />}
            onClick={() => toggleOption(comment.id)}
          />
          {openOptionId === comment.id && (
            <Box position="absolute" bg="white" boxShadow="md" p={2} zIndex={10}>
              <Button size="xs" onClick={() => handleEdit(comment.id)}>수정</Button>
              <Button size="xs" onClick={() => handleDelete(comment.id)}>삭제</Button>
            </Box>
          )}
        </Box>
      </Flex>

      {/* 대댓글 */}
      {replies.length > 0 && (
        <Box mt={2}>
          {replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} replies={[]} />
          ))}
        </Box>
      )}
    </Box>
  );
}
