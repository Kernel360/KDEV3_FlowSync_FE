// 결재 글 열람 페이지
"use client";

// 외부 라이브러리
import { Box, VStack, Flex, Text, Button } from "@chakra-ui/react";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

// 절대 경로 파일
import ArticleContent from "@/src/components/common/ArticleContent";
import ArticleComments from "@/src/components/common/ArticleComments";
import CommentBox from "@/src/components/common/CommentBox";
import { readApprovalApi } from "@/src/api/ReadArticle";
import SignToApprove from "@/src/components/pages/ProjectApprovalPage/components/SignToApprove";
import { ArticleComment, ApprovalArticle } from "@/src/types";
import { deleteApprovalApi } from "@/src/api/RegisterArticle";
import { getMeApi } from "@/src/api/getMembersApi";
import DropDownMenu from "@/src/components/common/DropDownMenu";
import DropDownInfoBottom from "../../common/DropDownInfoBottom";
import { showToast } from "@/src/utils/showToast";

export default function ProjectApprovalPage() {
  const { projectId, approvalId } = useParams() as {
    projectId: string;
    approvalId: string;
  };
  const router = useRouter();

  const [article, setArticle] = useState<ApprovalArticle | null>(null);
  const [category, setCategory] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [commentList, setCommentList] = useState<ArticleComment[]>([]);
  const [commentIsWritten, setCommentIsWritten] = useState<boolean>(false);
  const [registerSignatureUrl, setRegisterSignatureUrl] = useState<string>();
  const [approverSignatureUrl, setApproverSignatureUrl] = useState<string>();
  const [registerOrgId, setRegisterOrgId] = useState<number>(); // 자기 업체 글인지 확인
  const [registerName, setRegisterName] = useState<string>("");
  const [myOrgId, setMyOrgId] = useState<number>();
  const [myName, setMyName] = useState<string>("");

  useEffect(() => {
    const loadApproval = async () => {
      try {
        const myData = await getMeApi();
        setMyName(myData.data.name);
        setMyOrgId(myData.data.organizationId);

        const responseData = await readApprovalApi(
          Number(projectId),
          Number(approvalId),
        );
        console.log(responseData.register);

        setArticle(responseData);
        setCategory(responseData.category);
        setCommentList(responseData.commentList ?? []);
        setRegisterSignatureUrl(responseData.register.signatureUrl);
        setRegisterOrgId(responseData.register.organizationId);
        setRegisterName(responseData.register.name);

        if (responseData.status === "APPROVED") {
          setApproverSignatureUrl(responseData.approver?.signatureUrl);
        } else if (responseData.status === "REJECTED") {
          // setApproverSignatureUrl("/비추_고화질.png");
          setApproverSignatureUrl("/badge-x.png");
        } else {
          setApproverSignatureUrl(responseData.approver?.signatureUrl);
        }
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
    loadApproval();
  }, [projectId, approvalId, commentIsWritten]);

  if (error) {
    return <Box>에러 발생: {error}</Box>;
  }

  if (loading) {
    return <Box>로딩 중...</Box>;
  }

  console.log(myName);
  console.log(myOrgId);

  const handleEdit = () => {
    if (approverSignatureUrl !== undefined) {
      const errorMessage = "결재가 완료된 글은 수정할 수 없습니다.";
      showToast({
        title: "요청 실패",
        description: errorMessage,
        type: "error",
        duration: 3000,
        error: errorMessage,
      });
      return;
    }
    router.push(`/projects/${projectId}/approvals/${approvalId}/edit`);
  };

  const handleDelete = async () => {
    if (approverSignatureUrl !== undefined) {
      const errorMessage = "결재가 완료된 글은 삭제할 수 없습니다.";
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
      const response = await deleteApprovalApi(
        Number(projectId),
        Number(approvalId),
      );
      if (response.message) {
        showToast({
          title: "요청 성공",
          description: response.message,
          type: "success",
          duration: 3000,
        });
      }
      router.push(`/projects/${projectId}/approvals`);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "결재 글 삭제 중 중 오류가 발생했습니다.";

      // ✅ 토스트로 사용자에게 알림
      showToast({
        title: "요청 실패",
        description: errorMessage,
        type: "error",
        duration: 3000,
        error: errorMessage,
      });
    }
  };

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

      {/* 게시글 내용 */}
      <Flex justifyContent={"space-between"}>
        <Button
          borderRadius={"xl"}
          fontSize={"xl"}
          fontWeight={"bold"}
          color={"#7e6551"}
          backgroundColor={"#f9f9f9"}
          mb={2}
          cursor="default"
        >
          {category === "NORMAL_REQUEST" ? "일반 결재" : "진행단계 완료 결재"}
        </Button>
        {myName === registerName && myOrgId === registerOrgId ? (
          <DropDownMenu onEdit={handleEdit} onDelete={handleDelete} />
        ) : null}
      </Flex>

      <ArticleContent article={article} />

      <Box display={"flex"} direction={"row"} alignItems={"center"}>
        <Text fontWeight="bold" pr={2}>
          서명
        </Text>
        <DropDownInfoBottom
          text={`결재 글은 서명을 기입해야 결재가 완료됩니다. \n "서명 불러오기" 는 기존에 저장된 서명을 불러옵나다. \n 새 서명을 기입하고 "등록" 을 누르면 기존에 저장되어 있던 서명은 삭제됩니다.`}
        />
      </Box>
      <Box display={"flex"} direction={"column"} justifyContent={"center"}>
        <SignToApprove
          registerSignatureUrl={registerSignatureUrl}
          approverSignatureUrl={approverSignatureUrl}
          registerOrgId={registerOrgId}
        />
      </Box>

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
