import axiosInstance from "@/src/api/axiosInstance";
import { showToast } from "@/src/utils/showToast";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function deleteComment(
  projectId: number,
  questionId: number,
  commentId: number,
) {
  try {
    const response = await axiosInstance.delete(
      `${BASE_URL}/projects/${projectId}/questions/${questionId}/comments/${commentId}`,
    );
    console.log(response.data);
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "데이터를 불러오는데 실패했습니다.";
    showToast({
      title: "요청 실패",
      description: errorMessage,
      type: "error",
      duration: 3000,
      error: errorMessage,
    });
    throw error;
  }
}
