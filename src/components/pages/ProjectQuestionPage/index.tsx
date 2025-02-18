// questionId 글 열람 페이지
"use client";

// 외부 라이브러리
import { Flex, Box, VStack } from "@chakra-ui/react";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

// 절대 경로 파일
import ArticleContent from "@/src/components/common/ArticleContent";
import ArticleComments from "@/src/components/common/ArticleComments";
import CommentBox from "@/src/components/common/CommentBox";
import BackButton from "@/src/components/common/BackButton";
import { readQuestionApi } from "@/src/api/ReadArticle";
import DropDownMenu from "@/src/components/common/DropDownMenu";
import { QuestionArticle, ArticleComment } from "@/src/types";
import { deleteQuestionApi } from "@/src/api/RegisterArticle";
import { showToast } from "@/src/utils/showToast";
import { getMeApi } from "@/src/api/getMembersApi";

export default function ProjectQuestionPage() {
  const { projectId, questionId } = useParams() as {
    projectId: string;
    questionId: string;
  };
  const router = useRouter();

  const [article, setArticle] = useState<QuestionArticle | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [commentList, setCommentList] = useState<ArticleComment[]>([]);
  const [commentIsWritten, setCommentIsWritten] = useState<boolean>(false);
  const [registerOrgId, setRegisterOrgId] = useState<number>(); // 자기 업체 글인지 확인
  const [registerName, setRegisterName] = useState<string>("");
  const [myOrgId, setMyOrgId] = useState<number>();
  const [myName, setMyName] = useState<string>("");

  // 글 렌더링
  useEffect(() => {
    const loadTask = async () => {
      try {
        const myData = await getMeApi();
        setMyOrgId(myData.data.organizationId);
        setMyName(myData.data.name);

        const responseData = await readQuestionApi(
          Number(projectId),
          Number(questionId),
        );

        setArticle(responseData);
        setCommentList(responseData.commentList ?? []);
        setRegisterName(responseData.register.name);
        setRegisterOrgId(responseData.register.organizationId);
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
  }, [projectId, questionId, commentIsWritten]);

  if (error) {
    return <Box>에러 발생: {error}</Box>;
  }

  if (loading) {
    return <Box>로딩 중...</Box>;
  }

  const handleEdit = () => {
    if (registerName !== myName && registerOrgId !== myOrgId) {
      const errorMessage = "수정 권한이 없습니다.";
      showToast({
        title: "요청 실패",
        description: errorMessage,
        type: "error",
        duration: 3000,
        error: errorMessage,
      });
      return;
    }
    router.push(`/projects/${projectId}/questions/${questionId}/edit`);
  };

  const handleDelete = async () => {
    if (registerName !== myName && registerOrgId !== myOrgId) {
      const errorMessage = "삭제 권한이 없습니다.";
      showToast({
        title: "요청 실패",
        description: errorMessage,
        type: "error",
        duration: 3000,
        error: errorMessage,
      });
      return;
    }
    const confirmDelete = window.confirm("정말로 삭제하시겠습니까?");
    if (!confirmDelete) return;
    try {
      await deleteQuestionApi(Number(projectId), Number(questionId));
      alert("게시글이 삭제되었습니다.");
      router.push(`/projects/${projectId}/questions`);
    } catch (error) {
      alert(`삭제 중 문제가 발생했습니다 : ${error}`);
    }
  };

  return (
    <Flex
      direction="column"
      maxW="1000px"
      w="100%"
      mx="auto"
      mt={10}
      p={6}
      borderWidth={1}
      borderRadius="lg"
      boxShadow="md"
    >
      <Flex justifyContent="space-between">
        <BackButton />
        <DropDownMenu onEdit={handleEdit} onDelete={handleDelete} />
      </Flex>

      {/* 게시글 내용 */}
      <ArticleContent article={article} />
      {/* 댓글 섹션 */}
      <VStack align="stretch" gap={8} mt={10}>
        <ArticleComments
          comments={commentList}
          setCommentIsWritten={setCommentIsWritten}
        />
        <CommentBox setCommentIsWritten={setCommentIsWritten} />
      </VStack>
    </Flex>
  );
}
