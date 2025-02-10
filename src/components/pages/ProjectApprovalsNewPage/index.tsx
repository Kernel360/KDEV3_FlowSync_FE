// 결재 글 생성 페이지

"use client";
// 목데이터 사용

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Box } from "@chakra-ui/react";
import BackButton from "@/src/components/common/BackButton";
import ArticleForm from "@/src/components/common/ArticleForm";
import { createTaskApi } from "@/src/api/RegisterArticle";
import { ProjectProgressStepProps, ApprovalRequestData } from "@/src/types";
import { projectProgressStepApi } from "@/src/api/projects";
import { useFetchData } from "@/src/hook/useFetchData";
import FormSelectInput from "@/src/components/common/FormSelectInput";
import "./edit.css";

export default function ProjectApprovalsNewPage() {
  const { projectId } = useParams();
  const router = useRouter();
  const [title, setTitle] = useState<string>("");

  const resolvedProjectId = Array.isArray(projectId)
    ? projectId[0]
    : projectId || "";

  const { data: progressStepData } = useFetchData<
    { id: number; name: string }[],
    [string]
  >({
    fetchApi: projectProgressStepApi,
    params: [resolvedProjectId],
  });

  const progressStepOptions = progressStepData
    ? progressStepData.map((step) => ({
        id: step.id, // key 값
        title: step.name, // 사용자에게 보이는 텍스트
        value: String(step.id), // select 요소에서 사용할 값
      }))
    : [];

  const [progressStepId, setProgressStepId] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (progressStepOptions.length > 0 && progressStepId === undefined) {
      setProgressStepId(progressStepOptions[0].id);
    }
  }, [progressStepOptions]);

  const handleSave = async <T extends ApprovalRequestData>(requestData: T) => {
    try {
      const response = await createTaskApi(Number(projectId), {
        ...requestData,
        ...(requestData.progressStepId !== undefined
          ? { progressStepId: requestData.progressStepId }
          : {}),
      });
      alert("저장이 완료되었습니다.");
      router.push(`/projects/${projectId}/approvals`);
    } catch (error) {
      console.error("저장 실패:", error);
      alert("저장 중 문제가 발생했습니다.");
    }
  };
  console.log(progressStepId)
  return (
    <Box
      maxW="1000px"
      w={"100%"}
      mx="auto"
      mt={10}
      p={6}
      borderWidth={1}
      borderRadius="lg"
      boxShadow="md"
    >
      <BackButton />

      <ArticleForm title={title} setTitle={setTitle} handleSave={handleSave} progressStepId={progressStepId ?? 0}>
        <FormSelectInput
          label="진행 단계"
          selectedValue={progressStepId}
          setSelectedValue={setProgressStepId}
          options={progressStepOptions}
        />
      </ArticleForm>
    </Box>
  );
}
