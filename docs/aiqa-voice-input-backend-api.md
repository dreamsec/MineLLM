# 大模型主界面语音输入后端对接文档

**日期**: 2026-07-02  
**状态**: 一期设计  
**适用范围**: 大模型智能问答主界面 `AIQA` 的语音输入  
**不包含范围**: 首页报警弹窗里的 `AI助手` 暂不接入语音输入

---

## 1. 背景

前端计划在“大模型智能问答”主界面增加麦克风按钮。用户点击后录制一段语音，前端上传音频到后端，后端用本地离线 ASR 转写成文字并返回。

一期只做“录音转文字”，不自动发送给大模型。前端拿到转写文本后填入输入框，由用户确认或修改后再点击发送，继续复用现有 `/api/v1/chat/stream` 大模型问答接口。

---

## 2. 推荐方案

一期推荐使用 **sherpa-onnx CPU/int8 + 非流式录音转写**。

推荐原因：

- 不占用 GPU 显存，避免和大模型、视觉模型抢资源。
- ONNX Runtime 部署相对轻，不依赖 PyTorch。
- 支持本地离线，适合矿区内网环境。
- 一期非流式接口简单，前后端联调成本低。

推荐模型方向：

- 中文普通话：Paraformer 中文离线模型。
- 中英混合：Paraformer bilingual zh-en。
- 资源紧张：优先选 int8 量化模型。

二期如果需要更接近实时语音助手体验，再升级为 WebSocket 流式识别。

---

## 3. 整体流程

```text
AIQA 主界面麦克风按钮
  ↓
前端浏览器录音
  ↓
POST /api/v1/chat/transcribe 上传音频
  ↓
后端 CPU ASR 转写
  ↓
返回 text
  ↓
前端填入 AIQA 输入框
  ↓
用户确认后点击发送
  ↓
复用现有 /api/v1/chat/stream
```

---

## 4. 后端接口

### 4.1 语音转写接口

```http
POST /api/v1/chat/transcribe
Content-Type: multipart/form-data
Authorization: Bearer <token>
```

### 4.2 请求参数

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| file | File | 是 | 前端录制的音频文件 |
| language | string | 否 | 语言，默认 `zh` |
| hotwords | string | 否 | 热词，逗号分隔；后端也可以忽略前端传值，统一读取服务端热词表 |

前端一期预计上传浏览器录音文件，常见格式是：

```text
audio/webm; codecs=opus
```

后端建议统一转码为：

```text
16kHz / mono / PCM wav
```

再送入 ASR 模型。

### 4.3 成功响应

外层响应结构沿用项目现有统一格式。`code` 成功值按后端现有规范保持一致。

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "text": "帮我分析一下通风机一号的报警",
    "duration_ms": 860,
    "engine": "sherpa-onnx",
    "language": "zh"
  }
}
```

字段说明：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| text | string | ASR 转写后的文本，前端会填入输入框 |
| duration_ms | number | 本次转写耗时，单位毫秒 |
| engine | string | 使用的 ASR 引擎，例如 `sherpa-onnx` |
| language | string | 实际识别语言 |

### 4.4 失败响应

```json
{
  "code": 400,
  "message": "音频文件为空或格式不支持",
  "data": null
}
```

建议错误类型：

| HTTP 状态码 | 场景 | message 建议 |
| --- | --- | --- |
| 400 | 未上传文件 | 音频文件不能为空 |
| 400 | 音频格式不支持 | 音频格式不支持 |
| 413 | 文件过大 | 音频文件过大 |
| 422 | 无法识别有效语音 | 未识别到有效语音 |
| 500 | ASR 服务异常 | 语音识别服务异常 |
| 503 | 模型未加载或服务不可用 | 语音识别服务暂不可用 |

---

## 5. 后端处理建议

### 5.1 音频预处理

建议后端不要直接假设浏览器上传的音频格式可被模型读取，而是统一做预处理：

```text
上传文件
  ↓
校验大小、MIME、时长
  ↓
临时保存
  ↓
ffmpeg 转码为 16k mono wav
  ↓
sherpa-onnx ASR 转写
  ↓
删除临时文件
  ↓
返回 text
```

建议限制：

- 单次录音时长：建议 5 秒到 60 秒。
- 单文件大小：建议不超过 20 MB。
- 空音频或纯静音：返回 `未识别到有效语音`。

### 5.2 模型加载

建议 ASR 模型在服务启动时加载，避免每次请求重新初始化模型。

建议提供启动日志：

```text
ASR engine: sherpa-onnx
ASR device: cpu
ASR model: paraformer-zh-int8
ASR sample_rate: 16000
```

### 5.3 显存控制

一期目标是“不占 GPU”。后端部署时建议显式固定 CPU：

```text
device = cpu
provider = CPUExecutionProvider
```

如果机器上有 GPU，也不要默认使用 CUDA Provider，避免抢占大模型或视觉模型显存。

### 5.4 热词与后处理

矿山场景专业词容易识别错，建议后端维护服务端热词表和后处理映射。

建议热词：

```text
主通风机
压风机
排水泵
主提升机
运输皮带
注油泵
润滑站
许疃煤矿
TF001
TF002
YF001
PS001
TS001
YS001
```

建议后处理例子：

| 可能识别结果 | 修正结果 |
| --- | --- |
| 通风机一号 | 通风机#1 |
| 压风机二号 | 压风机#2 |
| t f 0 0 1 | TF001 |
| p s 0 0 1 | PS001 |

---

## 6. 前端对接预期

前端只需要一个转写接口，不需要后端直接调用大模型。

前端行为：

1. 用户点击 AIQA 主界面麦克风按钮。
2. 浏览器请求麦克风权限。
3. 开始录音，按钮显示录音中。
4. 用户再次点击或达到最大时长后停止录音。
5. 前端上传音频到 `/api/v1/chat/transcribe`。
6. 后端返回 `data.text`。
7. 前端把 `text` 填入 AIQA 输入框。
8. 用户确认后手动点击发送。

前端不会在转写完成后自动发送，避免专业词识别错误导致误问。

---

## 7. 与现有大模型接口关系

现有大模型问答接口保持不变：

```http
POST /api/v1/chat/stream
```

语音输入只负责把语音变成文字，不负责生成回答。

也就是说：

```text
/api/v1/chat/transcribe 只做 ASR
/api/v1/chat/stream 继续做大模型回答
```

这两个接口职责需要保持分离。

---

## 8. 接口示例

### 8.1 curl 示例

```bash
curl -X POST "http://localhost:8000/api/v1/chat/transcribe" \
  -H "Authorization: Bearer <token>" \
  -F "file=@record.webm" \
  -F "language=zh"
```

### 8.2 Python 伪代码

```python
@router.post("/api/v1/chat/transcribe")
async def transcribe_audio(file: UploadFile = File(...), language: str = Form("zh")):
    # 1. 校验文件
    # 2. 保存临时文件
    # 3. 转码为 16k mono wav
    # 4. 调用 sherpa-onnx CPU 模型
    # 5. 做热词后处理
    # 6. 删除临时文件
    # 7. 返回统一响应
    return {
        "code": 0,
        "message": "success",
        "data": {
            "text": result_text,
            "duration_ms": duration_ms,
            "engine": "sherpa-onnx",
            "language": language,
        },
    }
```

---

## 9. 验收标准

一期后端完成后，建议按下面标准验收：

- 上传 5 到 10 秒普通话音频，可以返回可读中文文本。
- 服务运行期间 GPU 显存占用没有明显增加。
- 连续请求不会重复加载模型导致内存持续上涨。
- 上传空文件、超大文件、非音频文件时返回明确错误。
- 转写失败不会影响现有 `/api/v1/chat/stream`。
- 前端拿到 `data.text` 后可以填入 AIQA 输入框并正常发送给大模型。

---

## 10. 二期扩展方向

二期可以考虑：

- WebSocket 流式识别，边说边显示文字。
- 服务端热词管理接口。
- 按设备类型动态加载热词。
- 识别结果置信度返回。
- 语音活动检测 VAD，自动判断用户停止说话。
- 结合当前页面上下文做专业词纠错。

一期不建议直接做这些，先把“录音转文字 + 用户确认发送”的闭环跑通。
