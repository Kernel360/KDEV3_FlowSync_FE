// questionId 글 열람 페이지

// 결재 게시글 열람 페이지

"use client";

// 외부 라이브러리
import { Box, VStack } from "@chakra-ui/react";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";

// 절대 경로 파일
import TaskContent from "@/src/components/common/TaskContent";
import TaskComments from "@/src/components/common/TaskComments";
import CommentBox from "@/src/components/common/CommentBox";
import BackButton from "@/src/components/common/backButton";
import axiosInstance from "@/src/api/axiosInstance";
import { Task } from "@/src/types";

// fetchTaskData 함수
const fetchTaskData = async (
  projectId: string,
  questionId: string,
): Promise<Task | null> => {
  // 백엔드에서 api 명세서 경로 수정해야 함. projectId 키 값으로 넣을것임.
  const response = await axiosInstance.get<{ code: number; data: Task }>(
    `${projectId}/posts/${questionId}`,
  );
  if (response.data.code === 200) {
    return response.data.data;
  }
  return null;
};

export default function ProjectTaskPage() {
  const { projectId, questionId } = useParams() as {
    projectId: string;
    questionId: string;
  };

  const [task, setTask] = useState<Task | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadTask = async () => {
      try {
        const data = await fetchTaskData(projectId, questionId);
        // 검증. 받아온 json 의 projectid, id 가 주소창 값과 일치하는지 확인.
        if (
          data &&
          // data.projectid.toString() === projectId &&
          data.id.toString() === questionId
        ) {
          data.content = [
            {
              type: "paragraph",
              data: Array.isArray(data.content)
                ? data.content.join(" ")
                : data.content,
            },
          ];
          setTask(data); // JSON 데이터를 상태로 저장
        } else {
          throw new Error(
            "요청한 projectId, taskId 와 불러온 데이터가 다릅니다.",
          );
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

    loadTask();
  }, [projectId, questionId]);

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
      {task && <TaskContent task={task} />}

      {/* 댓글 섹션 */}
      <VStack align="stretch" gap={8} mt={10}>
        {task && <TaskComments comments={task.commentList} />}
        <CommentBox />
      </VStack>
    </Box>
  );
}
