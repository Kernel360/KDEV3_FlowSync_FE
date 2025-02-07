import axiosInstance from "@/src/api/axiosInstance";
import { QuestionRequestData, TaskRequestData } from "@/src/types";


export async function uploadFileApi(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axiosInstance.post("/file", formData, {
    headers: {
      "Content-type": "multipart/form-data",
    },
  });
  return response.data;
}

// 질문글 생성
export async function createQuestionApi(projectId: number, requestData: QuestionRequestData) {
  const response = await axiosInstance.post(
    `/projects/${projectId}/questions`,
    requestData,
  );
  return response.data;
}

// 결재글 생성
export async function createTaskApi(projectId: number, requestData: TaskRequestData) {
  const response = await axiosInstance.post(
    `/projects/${projectId}/approvals`,
    requestData,
  );
  return response.data;
}

// 질문글 수정
export async function editQuestionAPI(projectId: number, questionId: number,requestData: QuestionRequestData) {
  const response = await axiosInstance.post(
    `projects/${projectId}/questions/${questionId}`, requestData
  );
  return response.data;
}