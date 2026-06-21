# GreenPhil Supabase 로그인/회원 연동 절차

## 목표

Google/Naver 소셜 로그인은 Supabase Auth가 담당하고, GreenPhil 서비스에서 쓰는 회원 데이터는 백엔드 `users` 테이블과 연결한다.

현재 백엔드는 Supabase JWT의 `sub` 값을 `users.supabase_user_id`로 저장하는 구조다. 프론트는 로그인 성공 후 `/api/me`를 호출해서 백엔드 회원 row를 생성하거나 갱신한다.

## 개인정보 원칙

한국 서비스 기준으로 로그인 단계에서 필요한 정보만 수집한다.

- 필수 수집: Supabase user id, provider, 이메일, 닉네임
- 선택 수집: 프로필 이미지
- 수집하지 않기: 생년월일, 성별, 연령대, 실명, 전화번호, 위치
- 저장하지 않기: Google/Naver access token, refresh token

운영 전에는 개인정보 처리방침에 다음 내용을 명시해야 한다.

- 수집 항목
- 수집 목적
- 보유 기간
- 제3자 제공 여부
- 처리 위탁 여부
- 회원 탈퇴 및 삭제 방법
- 문의/권리 행사 방법

게시글/댓글은 탈퇴 시 즉시 삭제할지, 작성자를 익명화하고 남길지 정책을 먼저 정해야 한다.

## Supabase 설정

### 1. Redirect URL

Supabase Dashboard > Authentication > URL Configuration에서 아래를 등록한다.

- 개발: `http://localhost:3000`
- 운영: 실제 서비스 도메인

### 2. Google Provider

Google Cloud Console에서 OAuth Web Client를 만들고 Supabase Google provider에 Client ID/Secret을 입력한다.

Google Cloud에 등록할 값:

- Authorized JavaScript origins: `http://localhost:3000`, 운영 도메인
- Authorized redirect URI: Supabase Google provider 화면에 표시되는 callback URL

권장 scope:

- `openid`
- `email`
- `profile`

### 3. Naver Provider

우선 Supabase Custom OAuth Provider로 구성한다.

- Identifier: `custom:naver`
- Authorization URL: `https://nid.naver.com/oauth2.0/authorize`
- Token URL: `https://nid.naver.com/oauth2.0/token`
- UserInfo URL: `https://openapi.naver.com/v1/nid/me`

Naver Developers에 등록할 값:

- Client ID
- Client Secret
- Callback URL: Supabase custom provider가 표시하는 callback URL

주의: Naver userinfo 응답은 `response` 객체 안에 사용자 정보가 들어간다. Supabase custom provider에서 정상 매핑되지 않으면 Spring Boot에서 Naver OAuth를 처리하는 방식으로 전환한다.

## 프론트 환경 변수

`frontEnd/.env.local`에 설정한다.

```env
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
REACT_APP_API_BASE_URL=http://localhost:8080
```

publishable key는 브라우저에 노출되는 키지만, 프로젝트 이동성과 사고 방지를 위해 코드에 직접 고정하지 않는다.

## 백엔드 환경 변수

Supabase JWT를 Spring Security가 검증하려면 issuer가 필요하다.

```env
AUTH_DEV_MODE=false
SUPABASE_JWT_ISSUER=https://your-project.supabase.co/auth/v1
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

로컬에서 `AUTH_DEV_MODE=true`면 개발용 헤더 인증이 켜진다. 실제 OAuth 검증 테스트 때는 `AUTH_DEV_MODE=false`로 돌리는 편이 안전하다.

## 로그인 후 DB 연결 흐름

1. 사용자가 Google/Naver 로그인 버튼 클릭
2. Supabase OAuth redirect 진행
3. 프론트가 Supabase session 저장
4. 프론트가 `/api/me` 호출
5. `api.js`가 Supabase access token을 `Authorization: Bearer ...`로 전송
6. Spring Security가 JWT 검증
7. `CurrentUserService`가 `users.supabase_user_id`로 기존 회원 조회
8. 없으면 새 `UserAccount` 생성
9. 있으면 닉네임/아바타 갱신

## 실무 확인 리스트

- Google 로그인 후 `/api/me`가 200인지 확인
- Naver custom provider가 Supabase Auth user를 정상 생성하는지 확인
- Naver 프로필의 이메일/닉네임이 session metadata로 들어오는지 확인
- `/api/me` 실패 시 `SUPABASE_JWT_ISSUER` 값 확인
- service role key가 프론트에 없는지 확인
- provider access token을 DB에 저장하지 않는지 확인
