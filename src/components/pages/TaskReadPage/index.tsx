// questionId 글 열람 페이지
"use client";

// 외부 라이브러리
import { Box, VStack, Flex } from "@chakra-ui/react";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";

// 절대 경로 파일
import ArticleContent from "@/src/components/common/ArticleContent";
import ArticleComments from "@/src/components/common/ArticleComments";
import CommentBox from "@/src/components/common/CommentBox";
import BackButton from "@/src/components/common/BackButton";
import { readTaskApi } from "@/src/api/ReadArticle";
import SignToApprove from "@/src/components/pages/TaskReadPage/components/SignToApprove";
import { ArticleComment, TaskArticle } from "@/src/types";

export default function TaskReadPage() {
  const { projectId, taskId } = useParams() as {
    projectId: string;
    taskId: string;
  };

  const [article, setArticle] = useState<TaskArticle | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [commentList, setCommentList] = useState<ArticleComment[]>([]);
  const [commentIsWritten, setCommentIsWritten] = useState<boolean>(false);

  useEffect(() => {
    const loadTask = async () => {
      try {
        const responseData = await readTaskApi(
          Number(projectId),
          Number(taskId),
        );
        setArticle(responseData);
        setCommentList(responseData.commentList ?? []);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "데이터를 가져오는데 실패했습니다.",
        );
      } finally {
        setLoading(false);
      }
    };
    loadTask();
  }, [projectId, taskId, commentIsWritten]);

  if (error) {
    return <Box>에러 발생: {error}</Box>;
  }

  if (loading) {
    return <Box>로딩 중...</Box>;
  }

  return (
    <Box
      maxW="1000px"
      w="100%"
      mx="auto"
      mt={10}
      p={6}
      borderWidth={1}
      borderRadius="lg"
      boxShadow="md"
    >
      <BackButton />

      {/* 게시글 내용 */}

      <ArticleContent article={article} />

      {/* 결재 사인 섹션 */}
      <Flex justifyContent={"center"}>
        <SignToApprove />
      </Flex>

      {/* 댓글 섹션 */}
      <VStack align="stretch" gap={8} mt={10}>
        <ArticleComments
          comments={commentList}
          setCommentIsWritten={setCommentIsWritten}
        />
        <CommentBox setCommentIsWritten={setCommentIsWritten} />
      </VStack>
    </Box>
  );
}
