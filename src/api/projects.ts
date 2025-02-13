import axiosInstance from "@/src/api/axiosInstance";
import {
  CommonResponseType,
  ProjectListResponse,
  ProjectProgressStepProps,
  ProjectQuestionListResponse,
  ProjectApprovalListResponse,
  ProjectDetailProps,
  CreateProjectInput,
} from "@/src/types";

/**
 * 프로젝트 생성
 * @param requestData 프로젝트 생성 페이지 입력 데이터
 * @returns
 */
export async function createProjectApi(
  requestData: any,
): Promise<CommonResponseType<CreateProjectInput>> {
  try {
    const response = await axiosInstance.post("/admins/projects", requestData);
    return response.data;
  } catch (error) {
    console.error("프로젝트 생성 실패", error);
    throw error;
  }
}

/**
 * 프로젝트 수정
 * @param projectId 프로젝트 ID
 * @param requestData 프로젝트 수정 페이지 입력 데이터
 * @returns
 */
export async function updateProjectApi(
  projectId: string,
  requestData: any,
): Promise<CommonResponseType<CreateProjectInput>> {
  try {
    const response = await axiosInstance.patch(
      `/admins/projects/${projectId}`,
      requestData,
    );
    return response.data;
  } catch (error) {
    console.error("프로젝트 수정 실패", error);
    throw error;
  }
}

/**
 * 프로젝트 삭제
 * @param projectId 프로젝트 ID
 * @returns
 */
export async function deleteProjectApi(
  projectId: string,
): Promise<CommonResponseType<string>> {
  try {
    const response = await axiosInstance.delete(
      `/admins/projects/${projectId}`,
    );
    return response.data;
  } catch (error) {
    console.error("프로젝트 삭제 실패", error);
    throw error;
  }
}

/**
 * 프로젝트 목록을 가져옵니다.
 * @param keyword 검색어 (기본값: "")
 * @param filter 필터링 값 (기본값: "")
 * @param currentPage 현재 페이지 번호
 * @param pageSize 페이지 크기
 * @returns 프로젝트 목록 및 페이징 정보를 담은 객체(BoardResponseProps)
 */
export async function fetchProjectListApi(
  keyword: string = "",
  status: string = "",
  currentPage: number,
  pageSize: number,
): Promise<CommonResponseType<ProjectListResponse>> {
  const response = await axiosInstance.get("/projects", {
    params: { keyword, status, currentPage, pageSize },
  });

  return response.data;
}

/**
 * (관리자 전용 페이지) 특정 프로젝트의 상세 정보를 가져옵니다.
 * @param projectId 프로젝트 식별자
 * @returns 프로젝트 상세 정보
 */
export async function fetchProjectDetailsApi(
  projectId: string,
): Promise<ProjectDetailProps> {
  const response = await axiosInstance.get(`/admins/projects/${projectId}`);
  console.log("프로젝트 상세 조회 API 호출 중 - response: ", response);
  return response.data.data;
}

/**
 * (고객사/개발사/관리자 공통 페이지) 특정 프로젝트의 요약 정보를 가져옵니다.
 * @param projectId 프로젝트 식별자
 * @returns 프로젝트 상세 정보
 */
export async function fetchProjectInfoApi(projectId: string) {
  const response = await axiosInstance.get(
    `/projects/${projectId}/projectInfo`,
  );
  return response.data;
}

/**
 * 특정 프로젝트의 진행 상황(Count)을 가져옵니다.
 * @param projectId 프로젝트 식별자
 * @returns 프로젝트 진행 상황 요약(숫자 형태)
 */
export async function fetchProjectQuestionProgressStepApi(
  projectId: string,
): Promise<CommonResponseType<ProjectProgressStepProps[]>> {
  const response = await axiosInstance.get(
    `/projects/${projectId}/questions/counts`,
  );
  return response.data;
}

/**
 * 특정 프로젝트의 진행 상황(Count)을 가져옵니다.
 * @param projectId 프로젝트 식별자
 * @returns 프로젝트 진행 상황 요약(숫자 형태)
 */
export async function fetchProjectApprovalProgressStepApi(
  projectId: string,
): Promise<CommonResponseType<ProjectProgressStepProps[]>> {
  const response = await axiosInstance.get(
    `/projects/${projectId}/approvals/counts`,
  );
  return response.data;
}

/**
 * 전체 프로젝트 상태 요약 정보를 가져옵니다.
 * 예: 진행 중, 완료 등 상태별 프로젝트 수
 * @returns 프로젝트 상태 요약 정보
 */
export async function fetchProjectsStatusCount() {
  const response = await axiosInstance.get("/projects/status-summary");
  return response.data;
}

/**
 * 특정 프로젝트(또는 게시글) 목록(게시판)을 가져옵니다.
 * @param projectId 프로젝트 식별자
 * @param keyword 검색어 (기본값: "")
 * @param progressStep 진행 단계(필터링)
 * @param status 게시글 상태(필터링)
 * @param currentPage 현재 페이지
 * @param pageSize 페이지 크기
 * @returns 게시글 목록 및 페이징 정보를 담은 데이터
 */
export async function fetchProjectQuestionListApi(
  projectId: string,
  keyword: string = "",
  progressStep: string = "",
  status: string = "",
  currentPage: number,
  pageSize: number,
): Promise<CommonResponseType<ProjectQuestionListResponse>> {
  const response = await axiosInstance.get(`/projects/${projectId}/questions`, {
    params: {
      keyword,
      progressStep,
      status,
      currentPage,
      pageSize,
    },
  });
  return response.data;
}

/**
 * 특정 프로젝트(또는 게시글) 목록(게시판)을 가져옵니다.
 * @param projectId 프로젝트 식별자
 * @param keyword 검색어 (기본값: "")
 * @param progressStep 진행 단계(필터링)
 * @param status 게시글 상태(필터링)
 * @param currentPage 현재 페이지
 * @param pageSize 페이지 크기
 * @returns 게시글 목록 및 페이징 정보를 담은 데이터
 */
export async function fetchProjectApprovalListApi(
  projectId: string,
  keyword: string = "",
  progressStep: string = "",
  status: string = "",
  currentPage: number,
  pageSize: number,
): Promise<CommonResponseType<ProjectApprovalListResponse>> {
  const response = await axiosInstance.get(`/projects/${projectId}/approvals`, {
    params: {
      keyword,
      progressStep,
      status,
      currentPage,
      pageSize,
    },
  });
  return response.data;
}
