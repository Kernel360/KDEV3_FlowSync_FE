import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL, // MSW용 환경 변수로 기본 URL 설정
  timeout: 10000, // 요청 타임아웃 설정 (10초)
  withCredentials: true,
});

// 요청 인터셉터: Content-Type 동적 설정
axiosInstance.interceptors.request.use((config) => {
  // Content-Type === multipart/form-data
  const isMultipart =
    config.headers &&
    config.headers?.get("Content-Type") === "multipart/form-data";
  // Content-Type이 지정되지 않았거나 multipart/form-data가 아닌 경우 기본값 설정
  if (!isMultipart) {
    config.headers?.set("Content-Type", "application/json");
  }
  return config;
});

// 응답 인터셉터 추가
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status == 403) {
      console.error("⛔ 403 Forbidden - 권한이 부족합니다.");
      alert("권한이 없습니다. 홈으로 이동합니다.");
      setTimeout(() => {
        window.location.href = "/";
      }, 100);
    } else if (status >= 500) {
      console.error("🚨 500+ Server Error - 서버 오류 발생.");
    } else {
      console.error("❌ 예상치 못한 오류 발생:", error.message);
    }
    return Promise.reject(error); // 에러를 호출한 컴포넌트로 전달
  },
);

export default axiosInstance;
