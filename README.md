# 🚀 ScanPanan - Game Win Rate Optimization & AI Analytics System

<div align="center">

![System Status](https://img.shields.io/badge/SYSTEM-OPERATIONAL-success?style=for-the-badge)
![Python Version](https://img.shields.io/badge/Python-3.10%2B-blue?style=for-the-badge&logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110.0-teal?style=for-the-badge&logo=fastapi)
![License](https://img.shields.io/badge/License-MIT-purple?style=for-the-badge)

**ระบบอัจฉริยะสำหรับการสแกนเป้าหมาย วิเคราะห์โครงสร้างเว็บ และปรับปรุงอัตราความสำเร็จของเกมแบบเรียลไทม์ พร้อมสถาปัตยกรรม Microservices และ RESTful API ส่วนตัว**

</div>

---

## 📋 สสารบัญ (Table of Contents)
- [ภาพรวมระบบ (System Overview)](#-ภาพรวมระบบ-system-overview)
- [สถาปัตยกรรมและแผนภาพการทำงาน (Architecture)](#-สถาปัตยกรรมและแผนภาพการทำงาน-architecture)
- [โครงสร้างโปรเจกต์ (Project Directory)](#-โครงสร้างโปรเจกต์-project-directory)
- [คู่มือการติดตั้งและใช้งาน (Installation & Setup)](#-คู่มือการติดตั้งและใช้งาน-installation--setup)
- [คู่มือการใช้งาน API (API Endpoints & Usage)](#-คู่มือการใช้งาน-api-api-endpoints--usage)
- [ระบบอัตโนมัติและ CI/CD Pipeline (GitHub Actions)](#-ระบบอัตโนมัติและ-cicd-pipeline-github-actions)
- [ลิงก์และแหล่งข้อมูลอ้างอิง (References & Useful Links)](#-ลิงก์และแหล่งข้อมูลอ้างอิง-references--useful-links)

---

## 🔍 ภาพรวมระบบ (System Overview)

**ScanPanan** ถูกพัฒนาขึ้นเพื่อตอบโจทย์การวิเคราะห์และปรับแต่งค่าความน่าจะเป็น (Win Rate Calibration) ของระบบเกมและเว็บเป้าหมาย โดยผสานการทำงานระหว่าง:
1. **Web Scraper & Target Extractor:** ดึงโครงสร้าง HTML และค้นหาฟอร์มอินพุตหรือพารามิเตอร์สำคัญของเป้าหมายอัตโนมัติผ่าน `BeautifulSoup` และ `aiohttp`[cite: 4]
2. **AI Optimization Engine:** ระบบประมวลผลคำนวณและปรับเทียบค่าความน่าจะเป็นตามเป้าหมายที่ผู้ใช้งานกำหนด พร้อมระบบสำรอง (Fallback Simulation) ในกรณีที่เป้าหมายมีการป้องกันการเข้าถึง[cite: 4]
3. **High-Performance REST API:** ขับเคลื่อนด้วย **FastAPI** รองรับการทำงานแบบ Asynchronous และเปิดให้ Framework ภายนอกเชื่อมต่อเรียกใช้งานได้ทันที[cite: 3]
4. **Interactive Dashboard:** หน้าจอควบคุมส่วนหน้า (Frontend) ที่ออกแบบด้วยดีไซน์แบบ Modern Dark Mode สำหรับสั่งการและแสดงผลลัพธ์แบบ Real-time

---

## 🏛️ สถาปัตยกรรมและแผนภาพการทำงาน (Architecture)

```text
[ User / Frontend Dashboard ] 
             │ (HTTP POST JSON)
             ▼
[ FastAPI Server (api_server.py) ] 
             │
             ├──────► [ ScanPanan Engine (engine.py) ] 
             │               ├──► Asynchronous Target Fetching (aiohttp)
             │               ├──► DOM Parsing & Input Extraction (BeautifulSoup)
             │               └──► AI Probability Weight Calibration
             │
             └──────► [ JSON Response Payload ] ──► [ Render on UI / Iframe ]
