# 前端项目说明与后端对接指南

本文档旨在为后端 / 数据库开发人员提供现存前端项目的数据结构、核心业务逻辑以及预期的 API 接口说明，以方便进行数据库建模和后端接口开发。

## 1. 项目概述
本项目是一款面向家庭（家长端与孩子端）的习惯养成、任务管理、英语阅读朗读打卡以及愿望奖励的互动式教育应用。
- **前端技术栈**: React 18, TypeScript, Tailwind CSS, Vite, framer-motion (动画), lucide-react (图标)。
- **状态管理**: 目前前端所有状态和数据均使用 React Context (`src/TaskContext.tsx`) 进行本地模拟管理，后端接入后需将其替换为网络请求 (RESTful API / GraphQL)。

## 2. 核心数据字典 (Data Models)
以下数据结构基于前端 `src/types.ts` 定义，也是数据库建模（表结构设计）的基础参考：

### 2.1 用户与账户关联 (User & Connection)
**User (用户账号)**
- `id`: string (UUID)
- `phone`: string (手机号，目前作为系统主要登录凭证)
- `password`: string (密码)
- `role`: 'parent' | 'child' (角色：家长/孩子)
- `createdAt`: datetime

**ChildProfile (孩子档案)**
- `id`: string
- `parentId`: string (关联的家长账号ID)
- `name`: string (孩子昵称)
- `avatar`: string (头像图片URL)
- `points`: number (当前可用总积分/钻石数)

**InvitationCode (家长邀请码 - 用于绑定)**
- `code`: string (随机邀请码，如6位数字)
- `parentId`: string (生成该邀请码的家长ID)
- `expiresAt`: datetime (过期时间)
- `used`: boolean (是否已使用)

### 2.2 任务系统 (Tasks & Submissions)
**Task (任务/习惯)**
- `id`: string
- `title`: string (任务标题)
- `desc`: string (任务描述)
- `reward`: number (完成任务奖励积分)
- `category`: string (分类：如"习惯"、"学习"等)
- `requireAudio`: boolean (是否要求语音打卡)
- `requirePhoto`: boolean (是否要求拍照打卡)
- `recurrence`: 'daily' | 'weekly' | 'quick' (刷新循环频率 / 快速任务)
- `icon`, `color`, `iconColor`: string (前端 UI 样式配置字段)
- `active`: boolean (当前是否启用)
- `isQuickIn`: boolean (是否快捷打卡)

**Submission (任务提交/打卡记录)**
- `id`: string
- `taskId`: string (关联 Task)
- `childId`: string (关联 ChildProfile)
- `status`: 'pending' | 'approved' | 'rejected' (审核状态)
- `submittedAt`: datetime (提交时间)
- `reviewedAt`?: datetime (家长审核时间)
- `comment`?: string (家长的审核评语)
- `rating`?: number (家长的星级评分 1-3)
- `photoUrl`?: string (图片打卡的图片连接 - 需后端对象存储如 OSS 支持)
- `audioUrl`?: string (普通语音打卡的音频连接)
- `readingData`?: JSON Object (结构化语音测评数据，详见下文 2.3 阅读测评数据)

### 2.3 英语阅读与测评 (Reading & Vocabulary)
**Article (英语阅读文章)**
- `id`: string
- `title`: string (文章标题)
- `contentEn`: string (英文正文)
- `contentZh`: string (中文翻译)
- `imageUrl`?: string (文章封面)
- `difficulty`: 1 | 2 | 3 (难度评级)
- `publishedAt`: datetime (发布时间)

**ReadingEvaluationData (朗读测评记录 - 挂载在 Submission 下)**
- `articleId`: string (关联的文章ID)
- `articleTitle`: string (文章标题)
- `contentEn`: string (英文文本)
- `evaluations`: JSON Object (记录每句话、每个单词的评分得分模块)
  - `overall`: 整体评分
  - `fluency`: 流利度
  - `accuracy`: 准确度
  - `completeness`: 完整度
  - `words`: { [wordIndex: number]: { score: number } } (每个单词得分细节)
*(注: 当前前端模拟了腾讯云 SOE 语音评测的返回，后端需实际对接腾讯云服务进行真实验证校验或透传保存机制)*

**VocabularyWord (生词本)**
- `id`: string
- `word`: string (英文单词)
- `addedAt`: datetime (收藏时间)

### 2.4 激励与积分系统 (Rewards & Points)
**Reward (愿望奖励)**
- `id`: string
- `title`: string (心愿标题)
- `cost`: number (兑换所需积分)
- `icon`, `color`, `iconColor`: string (前端UI样式)
- `suggestedBy`: 'parent' | 'child' (由谁提出)
- `status`: 'active' | 'pending' | 'rejected' (状态：使用中、待家长审批、被拒绝)
- `limitType`: 'unlimited' | 'weekly' | 'monthly' (兑换限制模式)
- `limitCount`: number (限制次数)

**PointTransaction (积分流水账单)**
- `id`: string
- `childId`: string (关联操作的孩子)
- `amount`: number (积分变动：正数为获得，负数为消费)
- `reason`: string (变动原因/描述)
- `type`: 'earn' | 'spend' (类别：收入 / 支出)
- `date`: datetime (流水发生时间)
- `relatedId`?: string (关联的任务 Submission ID 或 奖励 Reward ID)

### 2.5 通知系统 (Notifications)
**AppNotification (应用内通知)**
- `id`: string
- `type`: string ('task_submitted', 'task_approved', 'task_rejected', 'reward_redeemed', 'new_wish_suggested', 'wish_approved')
- `title`: string (通知标题)
- `message`: string (通知详情)
- `createdAt`: datetime
- `read`: boolean (是否已读)
- `relatedId`?: string (关联的业务源数据 ID)
- `targetRole`: 'parent' | 'child' (此条通知发送给家长端还是孩子端)

---

## 3. 推荐的后端 API 设计思路 (RESTful)

### 用户与认证 (/api/auth & /api/users)
- `POST /api/auth/login`: 手机号密码登录，返回 JWT Token。
- `POST /api/auth/register`: 注册账号。
- `POST /api/users/invite`: 生成绑定孩子账号的激活码。
- `POST /api/users/bind`: 孩子端输入邀请码，绑定关系。

### 任务域 (/api/tasks)
- `GET /api/tasks`: 获取当前启用的任务列表。
- `POST /api/tasks/:id/submit`: 孩子打卡任务 (如果是图片/语音，先请求对象存储上传凭证获取上传URL，再将URL附在Body提交)。
- `GET /api/submissions`: 获取待审批或已审批的打卡列表。
- `PUT /api/submissions/:submissionId/review`: 家长审批提交 (同意或拒绝)，同意时后端需在同一个事务中更新积分(创建`PointTransaction`)并推送 `Notification`。

### 愿望与积分域 (/api/rewards & /api/points)
- `GET /api/rewards`: 获取愿望列表。
- `POST /api/rewards`: 创建愿望 (家长直接创建，或孩子提出申请状态为pending)。
- `POST /api/rewards/:id/redeem`: 孩子兑换愿望 (后端事务扣减积分、防并发防超扣限制校验、生成流水)。
- `GET /api/points/history`: 获取孩子的积分流水明细。

### 英语阅读与生词 (/api/reading)
- `GET /api/articles`: 获取今日/全部英语阅读素材列表。
- `POST /api/vocabulary`: 将单个单词加入生词本。
- `DELETE /api/vocabulary/:id`: 全量或单独移除生词。

## 4. 后端开发注意事项 & 核心接入点
1. **多租户与鉴权体系**: 虽然前端本地是使用一套测试数据，但数据库设计必须保证数据隔离：除了公共数据库（如文章素材），所有 Task、Submission、Reward 一定要绑定 `parentId` / `childId` 建立家庭隔离。
2. **文件上传机制**: 图片打卡、朗读打卡的语音文件，以及可能的头像上传。后端需要提供签名接口（例如 AWS S3 Presigned URL / 阿里云 OSS STS 获取），由前端直传后，再把目标 URL 发送给业务接口，不要让文件流途经业务服务器以降低并发压力。
3. **英语朗读打卡积分 & 录音**: 目前针对句子跟读以及腾讯 SOE 语音质量评估是在前端模拟了评分返回格式。在正式接入时：前端应该采集音频发送到后端代理接口，后端将其调用大厂的语音测评服务 (如微信小程序里的英语跟读评估API)，获取分析后的分数与标签并存库。前端拿到结果后展现给家长。
4. **事务强一致性**: 用户积分增加与流水插入必须在数据库的同一个事务 (Transaction) 内。尤其是通过奖励消耗积分时，要做好行级锁/并发版本控制，防止积分变成负数。
5. **实时性交互**: 家长审核通过后，孩子端如何得知？当前系统没有引入 WebSocket，后端若不想太复杂可以提供短轮询接口或者使用 Server-Sent Events (SSE) 发送 `Notification` 通知。

## 5. 项目对接起步
要替换前端现有的数据模拟，可以从 `src/TaskContext.tsx` 处着手。目前定义在此处的 `useState` 和初始化 Mock 数据，应悉数替换成如 `React Query` (推荐) 或 `SWR`、`Axios` 的数据请求方法联动后端真实接口。
