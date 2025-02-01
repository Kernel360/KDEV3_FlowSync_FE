// 댓글 섹션의 최상위 컴포넌트

// 외부 라이브러리
import { Box, Text } from "@chakra-ui/react";
import Comments from "@/src/components/common/Comments";
import { ArticleComment } from "@/src/types";

interface ArticleCommentsProps {
    comments: ArticleComment[];
}

export default function ArticleComments({ comments }: ArticleCommentsProps) {

  return (
    <Box>
      <Box
        my={4}
        borderBottomWidth="1px"
        borderColor="gray.300"
        width="100%"
      />
      <Text fontSize="xl" fontWeight="bold" mb={4}>
        댓글
      </Text>
      {comments.length > 0 ? (
        <Comments comments={comments} />
      ) : (
        <Text color={"gray.500"} fontSize={"sm"}>댓글이 없습니다.</Text>
      )}
    </Box>
  );
}
