# Thive Lab - 프로젝트 포트폴리오

Next.js와 Supabase를 사용한 프로젝트 관리 포트폴리오 사이트

## 기술 스택

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Icons**: Lucide React
- **Deployment**: Vercel

## 기능

- 📱 반응형 디자인
- 🎨 다크 테마 UI
- 🔐 관리자 로그인 시스템
- 📊 Supabase 데이터베이스 연동
- ✏️ 실시간 프로젝트 CRUD
- 🎯 Bento Grid 레이아웃

## 시작하기

### 1. 저장소 클론

```bash
git clone <repository-url>
cd thive-lab
```

### 2. 패키지 설치

```bash
npm install
```

### 3. 환경 변수 설정

`.env.example` 파일을 `.env.local`로 복사하고 아래 값들을 설정하세요:

```env
# Admin credentials
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=your_admin_password

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Supabase 설정

1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. SQL Editor에서 `supabase/setup.sql` 파일의 내용을 실행
3. Settings > API에서 Project URL과 anon public key를 복사하여 `.env.local`에 추가

### 5. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 프로젝트 구조

```
thive-lab/
├── app/
│   ├── admin/           # 관리자 페이지
│   │   ├── login/       # 로그인 페이지
│   │   └── page.tsx     # 프로젝트 관리
│   ├── api/
│   │   ├── admin/       # 관리자 인증 API
│   │   └── projects/    # 프로젝트 CRUD API
│   ├── globals.css      # 글로벌 스타일
│   ├── layout.tsx       # 루트 레이아웃
│   └── page.tsx         # 메인 페이지
├── components/
│   └── ProjectCard.tsx  # 프로젝트 카드 컴포넌트
├── lib/
│   └── supabase.ts      # Supabase 클라이언트
├── supabase/
│   └── setup.sql        # 데이터베이스 스키마
└── .env.local           # 환경 변수 (git에서 제외)
```

## 데이터베이스 스키마

### projects 테이블

| 컬럼          | 타입      | 설명                          |
|---------------|-----------|-------------------------------|
| id            | BIGSERIAL | 기본 키                       |
| name          | TEXT      | 프로젝트명                    |
| status        | TEXT      | Live, Beta, Coming Soon       |
| description   | TEXT      | 프로젝트 설명                 |
| link          | TEXT      | 프로젝트 링크                 |
| icon_name     | TEXT      | 아이콘 이름                   |
| layout        | TEXT      | Grid 레이아웃 클래스          |
| created_at    | TIMESTAMPTZ | 생성 시간                   |
| updated_at    | TIMESTAMPTZ | 수정 시간                   |

## 관리자 페이지

`/admin` 경로로 접속하여 프로젝트를 관리할 수 있습니다.

- 프로젝트 추가, 수정, 삭제
- 실시간 데이터 동기화
- 아이콘 및 레이아웃 커스터마이징

## 배포

### Vercel 배포

1. Vercel에 프로젝트 연결
2. 환경 변수 설정:
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. 배포

## 보안

- 관리자 자격 증명은 환경 변수로 관리
- `.env.local` 파일은 Git에서 제외
- Row Level Security (RLS)로 데이터베이스 보호
- API 라우트에서 인증 토큰 검증

## 라이선스

MIT

## Contact

- Email: thive8564@gmail.com
- X (Twitter): [@devthive](https://x.com/devthive)
- GitHub: [@secuthive](https://github.com/secuthive)
