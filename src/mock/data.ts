import type { ArticleDetail, ArticleListItem, Category, Profile, Project, Tag } from '@/types'

const now = Date.now()
const days = (n: number) => new Date(now - n * 86400000).toISOString().slice(0, 19)

export const mockCategories: Category[] = [
  { id: '1', name: 'C++', sort: 1, createTime: days(300) },
  { id: '2', name: 'Java', sort: 2, createTime: days(280) },
  { id: '3', name: 'AI', sort: 3, createTime: days(260) },
  { id: '4', name: '音视频', sort: 4, createTime: days(240) },
  { id: '5', name: 'Linux', sort: 5, createTime: days(220) },
  { id: '6', name: '架构设计', sort: 6, createTime: days(200) }
]

export const mockTags: Tag[] = [
  { id: '1', name: 'FFmpeg' },
  { id: '2', name: 'OpenCV' },
  { id: '3', name: 'YOLO' },
  { id: '4', name: 'TensorRT' },
  { id: '5', name: 'GB28181' },
  { id: '6', name: 'Spring Boot' },
  { id: '7', name: 'Vue3' },
  { id: '8', name: 'MySQL' },
  { id: '9', name: 'Redis' },
  { id: '10', name: 'Docker' },
  { id: '11', name: 'Nginx' },
  { id: '12', name: '性能优化' }
]

const mdIntro = `
## 前言

在日常开发中，我们经常会遇到类似的问题：如何让一个系统同时具备**高性能**与**可维护性**。本文从一个真实项目出发，记录完整的思考过程与实践经验。

> 阅读本文大约需要 8 分钟，建议配合示例代码一起阅读。
`

const mdBody = `
### 一、问题背景

我们先来看一段典型的业务代码：

\`\`\`java
@Service
public class OrderService {

    private final OrderMapper orderMapper;

    public Order queryOrder(Long id) {
        // 直接查询数据库，未做任何缓存
        return orderMapper.selectById(id);
    }
}
\`\`\`

随着流量增长，上面的实现很快会成为瓶颈。下面是压测数据：

| 场景 | QPS | P99 延迟 | 数据库连接数 |
| ---- | --- | ------- | ----------- |
| 直接查询 | 800 | 42ms | 128 |
| 加一层缓存 | 5200 | 8ms | 16 |

### 二、整体设计

整体架构如下：

\`\`\`text
客户端
  │
  ▼
Nginx (负载均衡 / 静态资源)
  │
  ▼
Spring Boot (业务服务)
  │  ▲
  ▼  │
Redis (缓存层) ──── MySQL (持久层)
\`\`\`

#### 2.1 缓存更新策略

采用 Cache-Aside 模式，删除缓存而非更新缓存，避免并发写导致的数据不一致：

\`\`\`java
public Order getOrder(Long id) {
    // 1. 先查缓存
    Order order = cache.get("order:" + id);
    if (order != null) {
        return order;
    }
    // 2. 缓存未命中，查数据库
    order = orderMapper.selectById(id);
    // 3. 回填缓存
    cache.set("order:" + id, order, 30, TimeUnit.MINUTES);
    return order;
}
\`\`\`

### 三、关键实现细节

#### 3.1 热点数据保护

针对热点 Key 增加**逻辑过期**与**互斥重建**机制：

\`\`\`java
public Order getHotOrder(Long id) {
    String cacheKey = "hot:order:" + id;
    String value = redis.get(cacheKey);
    if (value != null) {
        return deserialize(value);
    }
    // 加锁，防止缓存击穿
    boolean locked = redis.setIfAbsent("lock:" + id, "1", 3, TimeUnit.SECONDS);
    if (locked) {
        try {
            Order order = orderMapper.selectById(id);
            redis.set(cacheKey, serialize(order), 30, TimeUnit.MINUTES);
            return order;
        } finally {
            redis.delete("lock:" + id);
        }
    }
    return orderMapper.selectById(id);
}
\`\`\`

#### 3.2 前端配合

Vue3 中封装统一的请求层：

\`\`\`ts
import axios from 'axios'

const request = axios.create({ baseURL: '/api', timeout: 10000 })

request.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = \`Bearer \${token}\`
  return config
})

request.interceptors.response.use(
  (res) => res.data,
  (err) => {
    if (err.response?.status === 401) {
      // 跳转登录
    }
    return Promise.reject(err)
  }
)
\`\`\`

### 四、性能对比

优化前后的对比图（示意）：

![性能对比](https://picsum.photos/seed/benchmark/800/400)

优化后整体吞吐提升约 **6.5 倍**，P99 延迟下降 **80%**。

### 五、总结

1. 缓存是提升读性能最有效的手段，但要关注**一致性**问题；
2. 热点 Key 需要专门的保护策略；
3. 合理的压测数据能帮助团队做容量规划。

希望本文对你有所帮助，欢迎在评论区交流。
`

const mdCpp = `
## 摘要

C++ 的\u0027现代\u0027版本迭代至今，现代 C++（C++11 及以后）已成为工业界的主流。本文梳理我常用的核心特性，并给出工程实践建议。

### 一、智能指针

优先使用 \`std::unique_ptr\`，共享所有权时使用 \`std::shared_ptr\`：

\`\`\`cpp
#include <memory>
#include <string>

class Session {
public:
    explicit Session(std::string id) : id_(std::move(id)) {}
private:
    std::string id_;
};

int main() {
    auto session = std::make_unique<Session>("s-1001");
    // 无需手动 delete，离开作用域自动释放
    return 0;
}
\`\`\`

### 二、RAII 与资源管理

\`\`\`cpp
class MutexGuard {
public:
    explicit MutexGuard(std::mutex& mtx) : mtx_(mtx) {
        mtx_.lock();
    }
    ~MutexGuard() { mtx_.unlock(); }
    MutexGuard(const MutexGuard&) = delete;
    MutexGuard& operator=(const MutexGuard&) = delete;
private:
    std::mutex& mtx_;
};
\`\`\`

### 三、std::optional 与返回值语义

\`\`\`cpp
#include <optional>

std::optional<int> find(const std::vector<int>& v, int target) {
    for (int x : v) {
        if (x == target) return x;
    }
    return std::nullopt;
}
\`\`\`

### 四、性能建议

- 使用 \`reserve\` 预分配 \`std::vector\` 容量；
- 传参时善用 \`const T&\`；
- 避免过度使用 \`std::function\`，考虑模板；
- 热点路径上避免频繁分配堆内存。

### 五、参考资料

| 资源 | 说明 |
| ---- | ---- |
| cppreference | 权威参考手册 |
| Effective Modern C++ | 40 条实战建议 |
| Abseil 文档 | 工程级最佳实践 |
`

const mdFFmpeg = `
## 从零开始理解 FFmpeg

FFmpeg 是音视频领域无可争议的瑞士军刀。这篇文章从**命令行**到**API 开发**，带你建立完整认知。

### 一、核心概念

- **容器（Container）**：如 MP4、FLV、TS，负责封装音视频流；
- **编解码（Codec）**：如 H.264、AAC，负责压缩与解压；
- **转封装（Remux）**：只改变容器，不重新编码；
- **转码（Transcode）**：解码后再重新编码。

### 二、命令行实战

提取视频中的音频：

\`\`\`bash
ffmpeg -i input.mp4 -vn -acodec copy output.aac
\`\`\`

HLS 切片输出：

\`\`\`bash
ffmpeg -i input.mp4 -c:v libx264 -c:a aac -f hls -hls_time 6 -hls_list_size 0 output.m3u8
\`\`\`

生成视频预览缩略图（九宫格）：

\`\`\`bash
ffmpeg -i input.mp4 -vf "fps=1/10,scale=160:90,tile=3x3" thumbnail.png
\`\`\`

### 三、SDK 开发：解码一帧

\`\`\`c
#include <libavformat/avformat.h>
#include <libavcodec/avcodec.h>

int main(int argc, char* argv[]) {
    avformat_network_init();
    AVFormatContext* fmt = nullptr;
    if (avformat_open_input(&fmt, argv[1], nullptr, nullptr) < 0) {
        return -1;
    }
    avformat_find_stream_info(fmt, nullptr);

    const AVCodec* codec = nullptr;
    int videoStream = av_find_best_stream(fmt, AVMEDIA_TYPE_VIDEO, -1, -1, &codec, 0);
    AVCodecContext* dec = avcodec_alloc_context3(codec);
    avcodec_parameters_to_context(dec, fmt->streams[videoStream]->codecpar);
    avcodec_open2(dec, codec, nullptr);

    avformat_close_input(&fmt);
    avcodec_free_context(&dec);
    return 0;
}
\`\`\`

### 四、常用滤镜

\`\`\`bash
# 加模糊水印
ffmpeg -i in.mp4 -vf "boxblur=20:5" -c:a copy out.mp4
# 视频拼接
ffmpeg -f concat -safe 0 -i list.txt -c copy concat.mp4
\`\`\`

### 五、工程实践要点

1. 转码任务建议使用**任务队列**异步执行；
2. 对源文件做**时长 / 分辨率校验**，防止恶意文件；
3. 生成多种清晰度供客户端自适应选择。
`

const mdYolo = `
## YOLO 目标检测部署实战：从训练到 TensorRT 加速

目标检测在安防、工业质检、自动驾驶等场景应用广泛。本文记录 YOLOv8 从训练到 \`TensorRT\` 部署的完整链路。

### 一、数据准备

使用 Roboflow 或自制数据集，YOLO 格式标注如下：

\`\`\`text
# 每行: class_id center_x center_y width height
0 0.5234 0.6123 0.1234 0.4321
1 0.7321 0.3456 0.0876 0.1234
\`\`\`

### 二、训练

\`\`\`python
from ultralytics import YOLO

model = YOLO("yolov8n.pt")
results = model.train(
    data="data.yaml",
    epochs=100,
    imgsz=640,
    device="cuda",
    project="runs/train"
)
\`\`\`

### 三、模型导出

导出为 ONNX 与 TensorRT Engine：

\`\`\`bash
# ONNX
yolo export model=best.pt format=onnx opset=12

# TensorRT Engine
trtexec --onnx=best.onnx \\
        --saveEngine=best.engine \\
        --fp16 \\
        --workspace=2048
\`\`\`

### 四、TensorRT C++ 推理

\`\`\`cpp
#include <NvInfer.h>
#include <NvOnnxParser.h>

std::shared_ptr<nvinfer1::ICudaEngine> buildEngine(
    const std::string& onnxPath, nvinfer1::ILogger& logger) {
    auto builder = std::unique_ptr<nvinfer1::IBuilder>(nvinfer1::createInferBuilder(logger));
    auto network = std::unique_ptr<nvinfer1::INetworkDefinition>(builder->createNetworkV2(0));
    auto parser = std::unique_ptr<nvonnxparser::IParser>(nvonnxparser::createParser(*network, logger));
    parser->parseFromFile(onnxPath.c_str(),
        static_cast<int>(nvinfer1::ILogger::Severity::kWARNING));
    auto config = std::unique_ptr<nvinfer1::IBuilderConfig>(builder->createBuilderConfig());
    config->setFlag(nvinfer1::BuilderFlag::kFP16);
    return std::unique_ptr<nvinfer1::ICudaEngine>(
        builder->buildEngineWithConfig(*network, *config));
}
\`\`\`

### 五、性能对比

| 平台 | 单帧延迟 (640x640) | 吞吐 (FPS) |
| ---- | ----------------- | ---------- |
| PyTorch (FP32) | 18ms | 55 |
| ONNX Runtime | 9ms | 110 |
| TensorRT (FP16) | 3ms | 320 |

### 六、总结

TensorRT 的 \`FP16\` 量化在本场景下可将吞吐提升 **5.8 倍**，且精度损失 < 0.5%。部署时建议同时提供 CPU 与 GPU 双路降级方案。
`

const mdOpenCV = `
## OpenCV 图像处理入门与实战

OpenCV 是计算机视觉领域使用最广泛的跨平台库。本文带你快速掌握其核心 API，并给出实际案例。

### 一、环境安装

\`\`\`python
pip install opencv-python opencv-python-headless
\`\`\`

### 二、图像基础操作

\`\`\`python
import cv2

img = cv2.imread("input.jpg")
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

# 高斯模糊
blur = cv2.GaussianBlur(gray, (5, 5), 0)
# 边缘检测
edges = cv2.Canny(blur, 50, 150)
# 阈值处理
_, thresh = cv2.threshold(edges, 127, 255, cv2.THRESH_BINARY)

cv2.imwrite("output.png", thresh)
\`\`\`

### 三、视频流处理

\`\`\`python
import cv2

cap = cv2.VideoCapture("rtsp://192.168.1.10:554/stream1")
while True:
    ret, frame = cap.read()
    if not ret:
        break
    h, w = frame.shape[:2]
    # 区域裁剪
    roi = frame[int(h*0.2):int(h*0.8), int(w*0.2):int(w*0.8)]
    cv2.imshow("frame", roi)
    if cv2.waitKey(1) & 0xFF == ord("q"):
        break
cap.release()
cv2.destroyAllWindows()
\`\`\`

### 四、C++ 常用 API

\`\`\`cpp
#include <opencv2/opencv.hpp>

int main() {
    cv::Mat img = cv::imread("input.jpg");
    cv::Mat hsv;
    cv::cvtColor(img, hsv, cv::COLOR_BGR2HSV);

    // 颜色过滤
    cv::Mat mask;
    cv::inRange(hsv, cv::Scalar(35, 40, 40), cv::Scalar(85, 255, 255), mask);

    // 形态学操作
    cv::Mat kernel = cv::getStructuringElement(cv::MORPH_RECT, {5, 5});
    cv::morphologyEx(mask, mask, cv::MORPH_CLOSE, kernel);

    // 连通域分析
    std::vector<std::vector<cv::Point>> contours;
    cv::findContours(mask, contours, cv::RETR_EXTERNAL, cv::CHAIN_APPROX_SIMPLE);
    return 0;
}
\`\`\`

### 五、实战：简单运动检测

基于帧差法：

\`\`\`python
prev = None
while True:
    ret, frame = cap.read()
    if not ret:
        break
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    gray = cv2.GaussianBlur(gray, (21, 21), 0)
    if prev is None:
        prev = gray
        continue
    diff = cv2.absdiff(prev, gray)
    thresh = cv2.threshold(diff, 25, 255, cv2.THRESH_BINARY)[1]
    prev = gray
\`\`\`
`

const mdSpringBoot = `
## Spring Boot 3 项目从 0 到 1

Spring Boot 3 基于 JDK 17 + Spring Framework 6，带来了更现代的编程体验。本文完整搭建一个 REST API 项目。

### 一、项目初始化

\`\`\`bash
curl https://start.spring.io/starter.tgz \\
  -d type=maven-project \\
  -d language=java \\
  -d javaVersion=17 \\
  -d dependencies=web,data-jpa,mysql,validation \\
  -o demo.tgz
\`\`\`

### 二、核心配置

\`\`\`yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/blog?useSSL=false&serverTimezone=UTC
    username: root
    password: 123456
  redis:
    host: localhost
    port: 6379

mybatis-plus:
  global-config:
    db-config:
      logic-delete-field: deleted
      logic-delete-value: 1
      logic-not-delete-value: 0
\`\`\`

### 三、实体与 Mapper

\`\`\`java
@TableName("article")
@Data
public class Article {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String title;
    private String summary;
    private String content;
    private Long categoryId;
    private Integer viewCount;
    private Integer status;
    private LocalDateTime createTime;
}
\`\`\`

\`\`\`java
public interface ArticleMapper extends BaseMapper<Article> {

    @Select("SELECT * FROM article WHERE status = 1 ORDER BY view_count DESC LIMIT 10")
    List<Article> selectHotArticles();
}
\`\`\`

### 四、统一响应与异常处理

\`\`\`java
@Data
public class Result<T> {
    private Integer code;
    private String message;
    private T data;

    public static <T> Result<T> ok(T data) {
        Result<T> r = new Result<>();
        r.code = 200;
        r.data = data;
        return r;
    }

    public static <T> Result<T> fail(String msg) {
        Result<T> r = new Result<>();
        r.code = 500;
        r.message = msg;
        return r;
    }
}
\`\`\`

### 五、JWT 认证

\`\`\`java
public class JwtUtil {

    private static final SecretKey KEY = Keys.hmacShaKeyFor(
        "blog-demo-secret-key-2026-change-me".getBytes());

    public static String generateToken(Long userId) {
        return Jwts.builder()
            .subject(String.valueOf(userId))
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + 24 * 3600 * 1000L))
            .signWith(KEY)
            .compact();
    }
}
\`\`\`

### 六、小结

Spring Boot 3 让开发更简洁，配合 MyBatis-Plus 与 Redis，可以快速构建中大型后台系统。记得做好**统一异常处理**与**参数校验**。
`

const mdLinux = `
## Linux 服务器常用运维手册

无论是部署博客、搭建服务还是排查线上问题，Linux 命令都是基本功。本文整理高频运维场景。

### 一、系统信息

\`\`\`bash
# 查看系统版本
cat /etc/os-release
# 查看内核
uname -r
# 查看内存 / CPU
free -h
top
\`\`\`

### 二、磁盘与文件

\`\`\`bash
# 查看磁盘占用
df -h
du -sh /var/log/*
# 查找大文件
find / -type f -size +500M 2>/dev/null
# 按权限查找
find . -perm 777 -type f
\`\`\`

### 三、网络排查

\`\`\`bash
# 查看监听端口
ss -tlnp
# 连接统计
netstat -nat | awk '{print $6}' | sort | uniq -c
# 测试连通性
curl -w "time_total: %{time_total}s\n" https://example.com
\`\`\`

### 四、进程管理

\`\`\`bash
# 查看进程树
ps -ef --forest
# 按 CPU / 内存排序
top -o %CPU
# 结束进程
kill -9 <pid>
pkill -f java
\`\`\`

### 五、日志分析

\`\`\`bash
# 统计访问量 TOP 10
cat access.log | awk '{print $1}' | sort | uniq -c | sort -rn | head -10
# 查看最近错误
grep -i "error" app.log | tail -50
# 实时跟踪
tail -f app.log
\`\`\`

### 六、安全加固要点

1. 修改 SSH 默认端口并禁用密码登录；
2. 使用 \`ufw\` / \`firewalld\` 最小化开放端口；
3. 定期 \`yum update\` / \`apt upgrade\` 更新安全补丁；
4. 配置 fail2ban 防止暴力破解。
`

const mdArchitecture = `
## 高可用架构设计：从单机到集群

当系统规模从几千用户增长到百万用户，架构如何演进？本文总结常见架构演进的几个阶段与关键决策。

### 一、单体应用阶段

- 单机部署 Web + DB；
- 适用：用户量小、迭代快的起步期；
- 注意：提前做好模块化分层，为拆分留出空间。

### 二、读写分离阶段

\`\`\`text
┌────────────┐
│ 应用服务器   │
└────┬───────┘
     │
 ┌───┴───┐
 │ Redis  │  ← 缓存
 └───┬───┘
┌────┴──────────────┐
│ MySQL 主库(写)     │
└────┬──────────────┘
     │  binlog 同步
┌────┴──────────────┐
│ MySQL 从库(读)     │
└───────────────────┘
\`\`\`

### 三、微服务与容器化

关键实践：

- **服务拆分**：按业务域拆分，避免过度拆分；
- **注册发现**：Nacos / Eureka；
- **网关**：统一鉴权、限流、路由；
- **链路追踪**：SkyWalking / Zipkin；
- **部署**：Docker + K8s。

\`\`\`yaml
version: "3.8"
services:
  gateway:
    image: blog-gateway:1.0
    ports:
      - "8080:8080"
    environment:
      - NACOS_ADDR=nacos:8848
    depends_on:
      - nacos
  article:
    image: blog-article:1.0
    deploy:
      replicas: 3
\`\`\`

### 四、稳定性保障

| 手段 | 说明 |
| ---- | ---- |
| 限流 | 令牌桶 / 滑动窗口，保护下游 |
| 熔断 | 依赖故障时快速失败 |
| 降级 | 非核心功能可关闭 |
| 重试 | 幂等接口安全重试 |
| 兜底缓存 | 极端情况下返回缓存 |

### 五、压测与容量规划

\`\`\`bash
# wrk 压测示例
wrk -t8 -c200 -d30s http://localhost:8080/api/article/list
\`\`\`

根据 QPS 目标、单机容量、冗余系数反推机器数量：\`机器数 = 目标QPS / 单机QPS / 冗余系数(0.6~0.7)\`。

### 六、总结

架构演进没有银弹。核心原则是：**按需演进、先稳定再优化、时刻保留降级能力**。
`

export const mockArticles: ArticleDetail[] = [
  {
    id: '1',
    title: 'Spring Boot 3 项目从 0 到 1：构建一个高性能 REST API',
    summary: '基于 JDK 17 + Spring Boot 3 + MyBatis-Plus 完整搭建 REST API 项目，涵盖统一响应、JWT 认证、缓存层设计等关键实践。',
    cover: 'https://picsum.photos/seed/spring/800/450',
    categoryId: '2',
    tags: [mockTags.find((t) => t.id === '6')!, mockTags.find((t) => t.id === '8')!, mockTags.find((t) => t.id === '9')!],
    viewCount: 10240,
    likeCount: 326,
    status: 1,
    content: `# ${'Spring Boot 3 项目从 0 到 1：构建一个高性能 REST API'}\n\n${mdIntro}${mdBody}`,
    createTime: days(3),
    updateTime: days(1)
  },
  {
    id: '2',
    title: 'FFmpeg 入门到精通：转码、滤镜与 SDK 开发',
    summary: '从命令行到 C API，系统梳理 FFmpeg 的核心概念、常用命令、转码流程与工程实践，快速上手音视频处理。',
    cover: 'https://picsum.photos/seed/ffmpeg/800/450',
    categoryId: '4',
    tags: [mockTags.find((t) => t.id === '1')!, mockTags.find((t) => t.id === '5')!],
    viewCount: 8215,
    likeCount: 258,
    status: 1,
    content: `# ${'FFmpeg 入门到精通：转码、滤镜与 SDK 开发'}\n\n## 阅读引导\n\n本文适合有基本 Linux 基础、想进入音视频方向的开发者。\n${mdFFmpeg}`,
    createTime: days(7),
    updateTime: days(5)
  },
  {
    id: '3',
    title: 'YOLO 目标检测部署实战：从训练到 TensorRT 加速',
    summary: '完整记录 YOLOv8 从数据准备、训练、ONNX 导出到 TensorRT FP16 加速部署的全流程，附性能对比数据。',
    cover: 'https://picsum.photos/seed/yolo/800/450',
    categoryId: '3',
    tags: [mockTags.find((t) => t.id === '3')!, mockTags.find((t) => t.id === '4')!, mockTags.find((t) => t.id === '2')!],
    viewCount: 15680,
    likeCount: 512,
    status: 1,
    content: `# ${'YOLO 目标检测部署实战：从训练到 TensorRT 加速'}\n\n## 阅读引导\n\n本文为 AI 推理部署方向的长文，建议收藏后分段阅读。\n${mdYolo}`,
    createTime: days(12),
    updateTime: days(10)
  },
  {
    id: '4',
    title: 'OpenCV 图像处理入门与实战：从像素到运动检测',
    summary: '掌握 OpenCV 核心 API，用 Python 与 C++ 双语言实现图像基础操作、视频流处理与运动检测实战案例。',
    cover: 'https://picsum.photos/seed/opencv/800/450',
    categoryId: '3',
    tags: [mockTags.find((t) => t.id === '2')!],
    viewCount: 6532,
    likeCount: 189,
    status: 1,
    content: `# ${'OpenCV 图像处理入门与实战'}\n\n## 阅读引导\n\n本文示例包含 Python 与 C++ 两套实现，可按需选择。\n${mdOpenCV}`,
    createTime: days(18),
    updateTime: days(15)
  },
  {
    id: '5',
    title: '现代 C++ 核心特性详解与工程实践',
    summary: '梳理智能指针、RAII、std::optional 等现代 C++ 核心特性，结合工程案例给出高性能代码实践建议。',
    cover: 'https://picsum.photos/seed/cpp/800/450',
    categoryId: '1',
    tags: [mockTags.find((t) => t.id === '12')!],
    viewCount: 4860,
    likeCount: 145,
    status: 1,
    content: `# ${'现代 C++ 核心特性详解与工程实践'}\n\n## 阅读引导\n\n本文面向已有 C 语言基础、希望系统学习现代 C++ 的开发者。\n${mdCpp}`,
    createTime: days(24),
    updateTime: days(20)
  },
  {
    id: '6',
    title: 'Linux 服务器常用运维手册：诊断与安全加固',
    summary: '从系统信息、磁盘、网络到日志分析，整理高频运维场景与安全加固要点，助你高效排查线上问题。',
    cover: 'https://picsum.photos/seed/linux/800/450',
    categoryId: '5',
    tags: [mockTags.find((t) => t.id === '10')!, mockTags.find((t) => t.id === '11')!],
    viewCount: 7421,
    likeCount: 203,
    status: 1,
    content: `# ${'Linux 服务器常用运维手册'}\n\n## 阅读引导\n\n建议把本文当作速查手册使用，Ctrl+F 快速定位场景。\n${mdLinux}`,
    createTime: days(32),
    updateTime: days(28)
  },
  {
    id: '7',
    title: '高可用架构设计：从单机到集群的演进之路',
    summary: '梳理架构演进的几个关键阶段，涵盖读写分离、缓存、微服务、稳定性保障与容量规划方法。',
    cover: 'https://picsum.photos/seed/arch/800/450',
    categoryId: '6',
    tags: [mockTags.find((t) => t.id === '10')!, mockTags.find((t) => t.id === '12')!],
    viewCount: 9134,
    likeCount: 287,
    status: 1,
    content: `# ${'高可用架构设计：从单机到集群的演进之路'}\n\n## 阅读引导\n\n本文偏架构设计方法论，阅读前建议了解基本的 Web 开发。\n${mdArchitecture}`,
    createTime: days(45),
    updateTime: days(40)
  },
  {
    id: '8',
    title: '缓存一致性实战：从缓存击穿到双写一致',
    summary: '深入剖析缓存穿透、击穿、雪崩三大问题，给出互斥重建、逻辑过期等解决方案与前端配合的最佳实践。',
    cover: 'https://picsum.photos/seed/cache/800/450',
    categoryId: '6',
    tags: [mockTags.find((t) => t.id === '9')!, mockTags.find((t) => t.id === '12')!],
    viewCount: 11890,
    likeCount: 402,
    status: 1,
    content: `# ${'缓存一致性实战：从缓存击穿到双写一致'}\n\n## 阅读引导\n\n本文结合 Redis 与 MySQL 讲解，适合后端进阶开发者。\n${mdBody}`,
    createTime: days(60),
    updateTime: days(55)
  },
  {
    id: '9',
    title: '基于 GB28181 的国标流媒体接入实践',
    summary: '解析 GB28181 协议的信令流程与媒体传输，分享服务端接入、录像回放与 Web 播放落地方案。',
    cover: 'https://picsum.photos/seed/gb28181/800/450',
    categoryId: '4',
    tags: [mockTags.find((t) => t.id === '5')!, mockTags.find((t) => t.id === '1')!],
    viewCount: 5230,
    likeCount: 168,
    status: 1,
    content: `# ${'基于 GB28181 的国标流媒体接入实践'}\n\n## 阅读引导\n\n本文面向安防、物联网音视频方向开发者。\n${mdFFmpeg}`,
    createTime: days(75),
    updateTime: days(70)
  },
  {
    id: '10',
    title: 'Vue3 + Vite 工程化实践：构建可维护的前端项目',
    summary: '从项目脚手架、目录规范到组合式 API 与状态管理，分享 Vue3 大型前端项目的工程化实践心得。',
    cover: 'https://picsum.photos/seed/vue/800/450',
    categoryId: '6',
    tags: [mockTags.find((t) => t.id === '7')!],
    viewCount: 6930,
    likeCount: 231,
    status: 1,
    content: `# ${'Vue3 + Vite 工程化实践'}\n\n## 阅读引导\n\n本文面向前端开发者，与后端读者亦可了解前端最佳实践。\n${mdIntro}${mdBody}`,
    createTime: days(90),
    updateTime: days(85)
  },
  {
    id: '11',
    title: '草稿示例：深入理解 MySQL 索引优化（未发布）',
    summary: '从 B+ 树结构出发，讲解联合索引、覆盖索引与回表原理，并提供 EXPLAIN 分析实战。',
    cover: 'https://picsum.photos/seed/mysql/800/450',
    categoryId: '2',
    tags: [mockTags.find((t) => t.id === '8')!],
    viewCount: 0,
    likeCount: 0,
    status: 0,
    content: `# ${'深入理解 MySQL 索引优化'}\n\n（草稿）本文仍在撰写中，敬请期待。\n${mdIntro}`,
    createTime: days(5),
    updateTime: days(2)
  }
]

export const mockProjects: Project[] = [
  {
    id: '1',
    name: 'SmartStream 国标流媒体网关',
    description: '基于 GB28181 与 WebRTC 的高性能流媒体接入网关，支持设备接入、HLS/FLV 直播、录像回放与 Web 端低延迟播放。',
    technology: 'C++, FFmpeg, WebRTC, Redis, Nginx',
    githubUrl: 'https://github.com/devpanda/smart-stream',
    image: 'https://picsum.photos/seed/smartstream/1200/675',
    deployment: 'Docker 一键部署，支持 k8s 水平扩展',
    featured: 1,
    createTime: days(120)
  },
  {
    id: '2',
    name: 'VisionBox 目标检测服务',
    description: '面向工业质检场景的目标检测服务，基于 YOLOv8 + TensorRT 加速，提供 HTTP/gRPC 双协议推理接口与结果可视化。',
    technology: 'Python, PyTorch, TensorRT, FastAPI, Docker',
    githubUrl: 'https://github.com/devpanda/vision-box',
    image: 'https://picsum.photos/seed/visionbox/1200/675',
    deployment: 'docker compose 部署，内置 GPU 调度',
    featured: 1,
    createTime: days(200)
  },
  {
    id: '3',
    name: 'BlogCloud 个人博客平台',
    description: '前后端分离的个人技术博客系统，前台支持 Markdown 渲染、自动目录与全文搜索，后台提供文章、分类、标签与评论管理。',
    technology: 'Vue3, TypeScript, Spring Boot, MyBatis-Plus, MySQL, Redis',
    githubUrl: 'https://github.com/devpanda/blog-cloud',
    image: 'https://picsum.photos/seed/blogcloud/1200/675',
    deployment: 'Nginx + Docker 容器化部署，HTTPS 证书自动续期',
    featured: 1,
    createTime: days(260)
  },
  {
    id: '4',
    name: 'DevOpsKit 服务器运维工具箱',
    description: '开箱即用的服务器巡检与自动化运维工具集，支持资源监控、日志分析与一键部署脚本生成。',
    technology: 'Go, Vue3, Shell, Grafana',
    githubUrl: 'https://github.com/devpanda/devops-kit',
    image: 'https://picsum.photos/seed/devopskit/1200/675',
    deployment: '单二进制文件分发，支持 systemd 托管',
    createTime: days(300)
  }
]

export const mockProfile: Profile = {
  nickname: 'DevPanda',
  avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=panda',
  tagline: '全栈工程师 · 音视频 / AI / 后端架构',
  bio: '拥有 8 年全栈开发经验，先后负责流媒体网关、AI 推理平台与高并发后端系统的设计与落地。热爱技术分享，坚信最好的学习方式是写出来。业余时间维护开源项目、撰写技术博客，乐于通过文字帮助更多开发者。',
  tags: ['音视频', 'AI 推理', '高并发', 'DevOps', '开源爱好者', '技术写作'],
  email: 'devpanda@example.com',
  location: '杭州 · 可远程办公',
  socials: [
    { name: 'GitHub', icon: 'Link', url: 'https://github.com/devpanda' },
    { name: 'Gitee', icon: 'Position', url: 'https://gitee.com/devpanda' },
    { name: '掘金', icon: 'EditPen', url: 'https://juejin.cn/user/devpanda' },
    { name: '邮箱', icon: 'Message', url: 'mailto:devpanda@example.com' }
  ]
}
