import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { fetchReissueToken, fetchUserInfo } from "@/src/api/auth";
import { UserInfoResponse } from "./types";

/**
 * 정적 파일 요청 및 `/login` 페이지는 미들웨어 실행 제외
 */
function shouldBypassMiddleware(pathname: string): boolean {
  return (
    pathname.startsWith("/_next/") || // Next.js 정적 리소스
    pathname.startsWith("/static/") || // 직접 제공하는 정적 파일
    ["/favicon.ico", "/robots.txt", "/login"].includes(pathname)
  );
}

/**
 * 로그인 페이지로 리디렉트 (쿠키 삭제 후)
 */
function handleUnauthorized(request: NextRequest) {
  console.log("🔹 Unauthorized Access → Redirecting to login");
  const res = NextResponse.redirect(new URL("/login", request.url));
  clearCookies(res);
  return res;
}


/**
 * 쿠키 삭제 함수
 */
function clearCookies(response: NextResponse) {
  response.headers.set("Set-Cookie", [
    "access=; Path=/; HttpOnly; Secure; SameSite=None; Domain=flowssync.com; Max-Age=0",
    "refresh=; Path=/; HttpOnly; Secure; SameSite=None; Domain=flowssync.com; Max-Age=0"
  ].join(", "));
}

/**
 * 쿠키 설정 함수
 */
function setAuthCookies(response: NextResponse, accessToken: string, refreshToken: string) {
  response.headers.set("Set-Cookie", [
    `access=${accessToken}; Path=/; HttpOnly; Secure; SameSite=None; Domain=flowssync.com; Max-Age=${30 * 60}`,
    `refresh=${refreshToken}; Path=/; HttpOnly; Secure; SameSite=None; Domain=flowssync.com; Max-Age=${24 * 60 * 60}`
  ].join(", "));
}

/**
 * ✅ 관리자 권한이 필요한 페이지 목록
 */
const adminPages = ["/admin"];

/**
 * 🔄 토큰 검증 및 리프레시 로직
 */
async function validateAndRefreshTokens(
  request: NextRequest
): Promise<{ userInfo?: UserInfoResponse; response?: NextResponse }> {
  let userInfoResponse;
  const accessToken = request.cookies.get("access")?.value;
  const refreshToken = request.cookies.get("refresh")?.value;
  const response = NextResponse.next();

  try {
    // 🔹 1. AccessToken 검증
    if (accessToken) {
      userInfoResponse = await fetchUserInfo(accessToken);
      if (userInfoResponse.result === "SUCCESS") {
        return { userInfo: userInfoResponse.data, response };
      }
    }
  } catch (error: any) {
    console.log("에러코드:", error.response?.status);
    if (error.response?.status === 401) {
      console.warn("🔄 Access Token 만료 → Refresh Token 사용 시도");
    } else {
      console.log("refresh:", refreshToken)
      console.error("❌ AccessToken 검증 중 오류 발생:", error.message);
      clearCookies(response);
      return { response: NextResponse.redirect(new URL("/login", request.url)) };
    }
  }

  if(!refreshToken) {
    console.warn("❌ Refresh Token 없음 → 로그인 페이지로 이동");
    return {}
  }
  
  try {
    // 🔹 2. Access Token 만료 → Refresh Token으로 재발급 시도
    console.log("🔄 Access Token 만료됨 → Refresh Token 사용");
    const reissueResponse = await fetchReissueToken(refreshToken);

    if (reissueResponse.data?.access && reissueResponse.data?.refresh) {
      console.log("✅ 새 Access Token 발급 성공 → 다시 요청 진행");

      // 쿠키에 새 AccessToken & RefreshToken 저장
      setAuthCookies(response, reissueResponse.data.access, reissueResponse.data.refresh);

      // 새 Access Token으로 유저 정보 가져오기
      const userInfoResponse = await fetchUserInfo(reissueResponse.data.access);
      if (userInfoResponse.result === "SUCCESS") {
        return { userInfo: userInfoResponse.data, response };
      }
    }
  } catch (error: any) {
    console.error("❌ Refresh Token 사용 중 오류 발생:", error.message);
    clearCookies(response);
  }
  
  return {}; // ❌ 모든 시도 실패 시 빈 객체 반환
}

export async function middleware(request: NextRequest) {
  // 요청 경로
  const pathname = request.nextUrl.pathname;

  // 정적 리소스 및 /login 페이지는 미들웨어 실행 제외
  if (shouldBypassMiddleware(pathname)) {
    return NextResponse.next();
  }

  const { userInfo, response } = await validateAndRefreshTokens(request);

  if (!userInfo) {
    return handleUnauthorized(request);
  }

  // 🔹 ✅ 로그인한 유저가 `/login`으로 접근할 경우 차단
  if (pathname === "/login") {
    console.warn("🚫 로그인한 유저가 로그인 페이지에 접근 → 홈으로 이동");
    return handleUnauthorized(request);
  }

  // `x-user-role` 헤더 추가하여 서버 컴포넌트에서 사용 가능하도록 설정
  response?.headers.set("x-user-id", userInfo.id);
  response?.headers.set("x-user-role", userInfo.role);

  // 🔹 ✅ 관리자 권한 검사를 배열을 사용하여 수행
  if (adminPages.some((path) => pathname.startsWith(path)) && userInfo.role !== "ADMIN") {
    console.warn("🚫 권한이 부족하여 홈으로 리디렉트됨");
    return  NextResponse.redirect(new URL("/", request.url));
  }
  
  return response;
}

export const config = {
  matcher: [
    "/((?!^/login$|^/_next/|^/static/|^/favicon.ico$|^/robots.txt$).*)",
  ],
};
