# สรุปความรู้: สถาปัตยกรรม Backend สำหรับโปรเจกต์ Nexus

เอกสารนี้สรุปแนวคิดหลักและหลักการทำงานของสถาปัตยกรรมฝั่ง Backend ที่ใช้ในโปรเจกต์ Nexus โดยเน้นที่การทำงานร่วมกันของ InversifyJS (Dependency Injection), TypeORM (ORM), และ Fastify (Web Framework)

---

## 1. หัวใจของ Dependency Injection - InversifyJS

Dependency Injection (DI) คือรูปแบบการออกแบบที่ช่วยลดการพึ่งพากันระหว่างส่วนต่างๆ ของโค้ด ทำให้โค้ดมีความยืดหยุ่น ทดสอบง่าย และบำรุงรักษาสะดวกขึ้น InversifyJS คือเครื่องมือ (IoC Container) ที่เราใช้จัดการเรื่องนี้

### 1.1 `inversify.config.ts`: ศูนย์กลางการจัดการ Dependencies

ไฟล์นี้เปรียบเสมือน "แผนที่" ของแอปพลิเคชัน ที่คอยบอก Inversify Container ว่า:
- มี Service และ Controller อะไรบ้างในระบบ
- ถ้าต้องการใช้งาน Interface (เช่น `IUserService`) จะต้องไปสร้างอ็อบเจกต์จากคลาสใด (เช่น `UserService`)

### 1.2 การทำงานของ `container.bind(...).to(...)`

บรรทัดโค้ด `container.bind<IAuthService>(TYPES.IAuthService).to(AuthService);` คือการสร้าง "กฎ" การผูกมัดใน Container ซึ่งแปลความหมายได้ว่า:

> "เมื่อมีส่วนใดในแอปพลิเคชันร้องขอ Dependency ที่มี Token เป็น `TYPES.IAuthService` ให้ Container สร้างอ็อบเจกต์จากคลาส `AuthService` แล้วส่งมอบให้"

- **`bind<IAuthService>`**: เริ่มสร้างกฎสำหรับ Interface `IAuthService`
- **`(TYPES.IAuthService)`**: คือ Token หรือ "ชื่อเรียก" ที่ไม่ซ้ำกันสำหรับ Dependency นี้
- **`.to(AuthService)`**: คือการระบุคลาสที่จะถูกสร้างขึ้นจริงเมื่อมีการร้องขอ

### 1.3 `@injectable()`: ป้ายบอกว่า "พร้อมใช้งาน"

Decorator `@injectable()` ที่อยู่บนคลาส (เช่น `UserService`) **ยังคงจำเป็นเสมอ** แม้จะใช้ Singleton Scope ก็ตาม เพราะมันทำหน้าที่คนละอย่างกัน:

- **`@injectable()`**: บอก Inversify ว่า "คลาสนี้สามารถถูกจัดการและฉีดเข้าไปในที่อื่นได้" และทำให้ Inversify สามารถอ่าน Dependencies ที่ `constructor` ของคลาสนี้ต้องการได้
- **`.inSingletonScope()`**: เป็นการกำหนด "วงจรชีวิต" ของอ็อบเจกต์ ว่าให้สร้างแค่ครั้งเดียว

หากไม่มี `@injectable()` บนคลาส, Inversify จะไม่รู้จักคลาสนี้และไม่สามารถสร้างหรือจัดการมันได้เลย

---

## 2. วงจรชีวิตของ Service (Lifecycle & Scope)

Scope คือการกำหนดว่าอ็อบเจกต์ที่ถูกสร้างโดย Container จะมีอายุการใช้งานยาวนานแค่ไหน

### 2.1 Transient vs. Singleton Scope

| Scope | การทำงาน | เหมาะสำหรับ |
| :--- | :--- | :--- |
| **Transient** (ค่าเริ่มต้น) | สร้างอ็อบเจกต์ใหม่ **ทุกครั้ง** ที่มีการร้องขอ (inject) | Service ที่มี State ชั่วคราว หรือทำงานเสร็จแล้วทิ้งไป |
| **Singleton** (`.inSingletonScope()`) | สร้างอ็อบเจกต์ **เพียงครั้งเดียว** และนำตัวเดิมกลับมาใช้ใหม่ทุกครั้ง | Service ที่ไม่มี State (Stateless) หรือจัดการการเชื่อมต่อภายนอก (เช่น Database, Elasticsearch) เพื่อประสิทธิภาพสูงสุด |

### 2.2 ผลเสียของการไม่ใช้ Singleton Scope (ในทางปฏิบัติ)

หากไม่ใช้ Singleton กับ Service ที่ควรใช้ จะเกิดผลเสียร้ายแรงต่อประสิทธิภาพ:

1.  **สร้าง Connection ซ้ำซ้อน:** `ElasticsearchService` จะสร้าง Connection ใหม่ไปยัง Elasticsearch Server ในทุกๆ Request ซึ่งใช้ทรัพยากร (CPU/Memory) สูงมากและทำให้แอปช้าลง
2.  **สร้างอ็อบเจกต์โดยไม่จำเป็น:** `UserService`, `DocumentService` จะถูกสร้างใหม่ทุก Request ทำให้สิ้นเปลืองหน่วยความจำและเพิ่มภาระให้ Garbage Collector
3.  **สูญเสีย State ที่ควรคงอยู่:** หาก Service มีการทำ Caching ข้อมูลไว้ในหน่วยความจำ Cache นั้นจะหายไปทุกครั้งที่มี Request ใหม่เข้ามา ทำให้การ Caching ไม่ได้ผล

### 2.3 Service ในโปรเจกต์ที่ควรเป็น Singleton

- **`ElasticsearchService` (สำคัญที่สุด):** เพราะมีการสร้าง Client ที่เชื่อมต่อกับระบบภายนอก
- **`SearchService`, `UserService`, `DocumentService`, `LinkService`, `AnnotationService`, `DashboardService`:** เพราะเป็น Service ที่ส่วนใหญ่เป็น Stateless (ไม่มีการเก็บสถานะ) การสร้างครั้งเดียวช่วยประหยัดทรัพยากร

---

## 3. การทำงานร่วมกับ Frameworks

### 3.1 TypeORM: `AppDataSource.getRepository()` และความสัมพันธ์กับ Singleton

- **`getRepository()` ทำงานคล้าย Singleton อยู่แล้ว:** เมื่อเราเรียก `AppDataSource.getRepository(User)` ครั้งแรก TypeORM จะสร้าง Repository สำหรับ `User` และเก็บไว้ ในการเรียกครั้งต่อไป มันจะคืนอ็อบเจกต์ Repository **ตัวเดิม** กลับมาเสมอ
- **ความสัมพันธ์:** การทำ Service (เช่น `UserService`) ให้เป็น Singleton Scope จะทำงานเสริมกันอย่างสมบูรณ์แบบกับ `getRepository` เพราะ `UserService` ที่ถูกสร้างขึ้นเพียงครั้งเดียว จะเรียก `getRepository` เพียงครั้งเดียว และใช้ Repository ตัวเดิมนั้นตลอดไป

### 3.2 TypeORM: ความสำคัญของ `AppDataSource.initialize()`

- **คือการ "เสียบปลั๊ก" ฐานข้อมูล:** คำสั่งนี้ในไฟล์ `index.ts` ทำหน้าที่เชื่อมต่อกับฐานข้อมูล, สร้าง Connection Pool, และทำการ Synchronize Schema (ในโหมด Development)
- **ต้องทำก่อนเริ่มเซิร์ฟเวอร์:** เราต้อง `await AppDataSource.initialize()` ให้สำเร็จ **ก่อน** ที่จะสร้างและเริ่มการทำงานของ Fastify Server เสมอ
- **ถ้าไม่มี:** ทุกครั้งที่ Service พยายามเรียก `getRepository` จะเกิด Error "DataSource is not initialized" และแอปพลิเคชันจะล่ม

### 3.3 Fastify: ลำดับการ Register Plugin ใน `server.ts`

**ลำดับมีความสำคัญอย่างยิ่ง** เพราะเป็นการสร้าง Layer ของฟังก์ชันการทำงาน:

1.  **`@fastify/cors` (แรกสุด):** จัดการเรื่อง CORS ซึ่งต้องทำงานก่อน Logic อื่นๆ
2.  **`@fastify/jwt`:** เพิ่มความสามารถด้าน JWT เข้าไปใน `server` และ `request`
3.  **`@fastify/swagger`:** เตรียมระบบสำหรับสร้างเอกสาร API
4.  **`server.decorate('container', container)`:** "ฝัง" Inversify Container เข้าไปใน `server` instance เพื่อให้ส่วนอื่นๆ (เช่น `registerRoutes`) เรียกใช้ได้
5.  **`registerRoutes(server)` (ท้ายสุด):** นำทุกสิ่งที่ตั้งค่าไว้ก่อนหน้ามาใช้เพื่อสร้าง API endpoints จริงๆ

### 3.4 Fastify: ทำไมต้องใช้ `.bind(this)` ใน Routes

- **ปัญหา `this` หาย:** เมื่อเราส่งเมธอดของ Controller (เช่น `authController.login`) ไปเป็น Callback ให้ Fastify, บริบทของ `this` จะไม่ได้ชี้ไปที่ `authController` instance อีกต่อไป ทำให้การเรียก `this.authService` กลายเป็น `undefined.authService` และเกิด Error
- **วิธีแก้:** `authController.login.bind(authController)` จะสร้างฟังก์ชันใหม่ขึ้นมาที่ "ล็อค" ค่าของ `this` ให้เป็น `authController` instance อย่างถาวร ไม่ว่าฟังก์ชันนั้นจะถูกเรียกโดยใครหรือในบริบทไหนก็ตาม

อธิบาย myContainer.bind<Warrior>(TYPES.Warrior).to(Samurai);

#### อธิบาย `myContainer.bind<Warrior>(TYPES.Warrior).to(Samurai);`

เรามาแยกประโยคนี้ออกเป็นส่วนๆ เพื่อทำความเข้าใจกันครับ

```typescript
myContainer.bind<Warrior>(TYPES.Warrior).to(Samurai);
```

- **`myContainer`**
  นี่คืออินสแตนซ์ของ `Container` ที่คุณสร้างขึ้น มันทำหน้าที่เหมือน "ตู้คอนเทนเนอร์" หรือ "ทะเบียนกลาง" ที่เก็บข้อมูลว่าถ้ามีคนมาขอของชิ้นนี้ (dependency) จะต้องส่งมอบของชิ้นไหนให้

- **`.bind<Warrior>(...)`**
  - `bind` คือเมธอดที่ใช้เริ่มต้นกระบวนการ "ผูก" หรือ "ลงทะเบียน" dependency
  - `<Warrior>` คือ Generic Type Parameter ที่ช่วยเรื่อง Type Safety ของ TypeScript มันบอกว่า "สิ่งที่ฉันกำลังจะผูกอยู่นี้ เมื่อถูกเรียกใช้ (resolve) ออกไปแล้ว มันควรจะมีไทป์เป็น `Warrior` นะ" ทำให้ตอนคุณใช้ `container.get<Warrior>(...)` ตัว TypeScript จะรู้ว่าผลลัพธ์ที่ได้คืออ็อบเจกต์ที่มีเมธอดตามที่ระบุใน `Warrior` interface

- **`(TYPES.Warrior)`**
  นี่คือส่วนที่สำคัญที่สุดเรียกว่า **Service Identifier** หรือ "คีย์" (Key) ที่ใช้ในการระบุ dependency
  - มันเปรียบเสมือน "ป้ายชื่อ" ที่คุณแปะไว้กับ dependency ของคุณ เวลาที่คุณต้องการ dependency นี้ คุณจะไม่ได้ขอด้วยชื่อคลาส `Samurai` แต่จะขอด้วยป้ายชื่อ `TYPES.Warrior`
  - การใช้ `Symbol` (เช่น `Symbol.for("Warrior")`) เป็น Identifier เป็นวิธีที่นิยมใน InversifyJS เพื่อป้องกันปัญหาชื่อซ้ำซ้อนกันในโปรเจกต์ขนาดใหญ่

- **`.to(Samurai)`**
  นี่คือส่วนที่บอกว่า "ถ้ามีคนมาขอของด้วยป้ายชื่อ `TYPES.Warrior`... ให้ไปสร้างอินสแตนซ์ของคลาส `Samurai` แล้วส่งให้เขาไป"
  - เป็นการจับคู่ระหว่าง "คีย์" (Identifier) กับ "ค่า" (Implementation Class)

#### สรุปความหมายทั้งประโยค

> "ถึง `myContainer`, ฉันขอลงทะเบียน dependency หนึ่งนะ โดยให้ใช้ป้ายชื่อ `TYPES.Warrior` เป็นตัวระบุ เมื่อไหร่ก็ตามที่มีคนมาขอ dependency ด้วยป้ายชื่อนี้ ขอให้ท่านช่วยสร้างอินสแตนซ์ของคลาส `Samurai` ส่งคืนไปให้ และเพื่อความถูกต้องทางไทป์ อินสแตนซ์ที่ส่งคืนไปนั้นจะมีไทป์เป็น `Warrior`"
