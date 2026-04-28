#!/usr/bin/env python3
"""
boss_bridge.py — JSON bridge for hr-platform web app.

Usage:
  python boss_bridge.py candidates [--job <encJobId>] [--page <n>]
  python boss_bridge.py resume <encryptGeekId> --job <encryptJobId>
  python boss_bridge.py jobs
  python boss_bridge.py search <keyword> [--city <city>] [--page <n>]

Output: JSON to stdout, errors to stderr.
"""

from __future__ import annotations

import json
import sys
import argparse
import logging

# Suppress rich/logging noise on stderr when called as subprocess
logging.disable(logging.CRITICAL)

sys.path.insert(0, str(__import__("pathlib").Path(__file__).parent.parent.parent / "boss-cli"))

from boss_cli.auth import get_credential
from boss_cli.client import BossClient, resolve_city
from boss_cli.exceptions import BossApiError


def _out(data: object) -> None:
    print(json.dumps(data, ensure_ascii=False, indent=2))


def _err(msg: str, code: int = 1) -> None:
    print(json.dumps({"ok": False, "error": msg}), file=sys.stdout)
    sys.exit(code)


def cmd_jobs() -> None:
    cred = get_credential()
    if not cred:
        _err("未登录，请先运行 boss login")
    with BossClient(credential=cred) as c:
        try:
            data = c.get_boss_chatted_jobs()
            _out({"ok": True, "data": data})
        except BossApiError as e:
            _err(str(e))


def cmd_candidates(enc_job_id: str = "", page: int = 1) -> None:
    cred = get_credential()
    if not cred:
        _err("未登录，请先运行 boss login")
    with BossClient(credential=cred) as c:
        try:
            # Use recommend list (greet rec sort) — returns active candidates
            raw = c.get_boss_greet_rec_list(enc_job_id=enc_job_id, page=page)
            items = raw.get("friendList", raw.get("list", []))

            # Fallback to friend list if recommend is empty
            if not items:
                raw = c.get_boss_friend_list(enc_job_id=enc_job_id, page=page)
                items = raw.get("friendList", raw.get("list", []))

            candidates = []
            for item in items:
                geek = item.get("geekInfo", item)
                enc_geek_id = (
                    geek.get("encryptGeekId")
                    or item.get("encryptUid")
                    or item.get("encryptGeekId", "")
                )
                enc_job = item.get("encryptJobId", enc_job_id)
                if not enc_geek_id:
                    continue
                candidates.append({
                    "encryptGeekId": enc_geek_id,
                    "name": geek.get("name") or item.get("name", ""),
                    "age": geek.get("age", ""),
                    "gender": geek.get("gender", ""),
                    "degree": geek.get("degreeName", geek.get("degree", "")),
                    "experience": geek.get("experienceName", geek.get("experience", "")),
                    "expectPosition": geek.get("expectPosition", ""),
                    "expectSalary": geek.get("expectSalaryDesc", geek.get("expectSalary", "")),
                    "city": geek.get("cityName", geek.get("city", "")),
                    "activeTime": geek.get("activeTimeDesc", item.get("lastTime", "")),
                    "avatar": geek.get("avatar") or item.get("avatar", ""),
                    "jobStatus": geek.get("jobStatusDesc", ""),
                    "jobName": item.get("jobName", ""),
                    "friendId": item.get("friendId", ""),
                    "encryptJobId": enc_job,
                    "securityId": item.get("securityId", ""),
                })
            _out({"ok": True, "data": candidates, "total": len(candidates)})
        except BossApiError as e:
            _err(str(e))


def cmd_resume(encrypt_geek_id: str, encrypt_job_id: str, security_id: str = "") -> None:
    cred = get_credential()
    if not cred:
        _err("未登录，请先运行 boss login")
    with BossClient(credential=cred) as c:
        try:
            raw = c.get_boss_view_geek(
                encrypt_geek_id=encrypt_geek_id,
                encrypt_job_id=encrypt_job_id,
                security_id=security_id,
            )
            gdi = raw.get("geekDetailInfo", {})
            base = gdi.get("geekBaseInfo", {})
            expect = gdi.get("anonymousGeekExpect", {}) or {}
            work_list = gdi.get("geekWorkExpList", []) or []
            edu_list = gdi.get("geekEduExpList", []) or []
            proj_list = gdi.get("geekProjExpList", []) or []
            skills_raw = gdi.get("blueGeekSkills", []) or []

            resume = {
                "encryptGeekId": encrypt_geek_id,
                "name": base.get("name", ""),
                "age": base.get("ageDesc", ""),
                "gender": "男" if base.get("gender") == 0 else "女",
                "degree": base.get("degreeCategory", ""),
                "experience": base.get("workYearsDesc", base.get("workYearDesc", "")),
                "city": expect.get("cityName", ""),
                "avatar": base.get("large", base.get("tiny", "")),
                "activeTime": base.get("activeTimeDesc", ""),
                "jobStatus": base.get("applyStatusDesc", base.get("applyStatusContent", "")),
                "expectPosition": expect.get("positionName", ""),
                "expectSalary": expect.get("salaryDesc", ""),
                "expectCity": expect.get("cityName", ""),
                "selfEvaluation": base.get("userDescription", ""),
                "skills": [s.get("name", "") for s in skills_raw if s.get("name")],
                "workExperiences": [
                    {
                        "company": w.get("brandName", w.get("companyName", "")),
                        "position": w.get("positionName", w.get("jobName", "")),
                        "startDate": w.get("startDate", ""),
                        "endDate": w.get("endDate", "至今"),
                        "description": w.get("jobContent", w.get("description", "")),
                    }
                    for w in work_list
                ],
                "educationExperiences": [
                    {
                        "school": e.get("schoolName", ""),
                        "major": e.get("major", e.get("majorName", "")),
                        "degree": e.get("degreeName", e.get("degreeCategory", "")),
                        "startDate": e.get("startDate", ""),
                        "endDate": e.get("endDate", ""),
                    }
                    for e in edu_list
                ],
                "projectExperiences": [
                    {
                        "name": p.get("projectName", ""),
                        "role": p.get("projectRole", ""),
                        "startDate": p.get("startDate", ""),
                        "endDate": p.get("endDate", ""),
                        "description": p.get("projectDesc", p.get("description", "")),
                    }
                    for p in proj_list
                ],
            }
            _out({"ok": True, "data": resume})
        except BossApiError as e:
            _err(str(e))


def cmd_search(keyword: str, city: str = "上海", page: int = 1, enc_job_id: str = "") -> None:
    cred = get_credential()
    if not cred:
        _err("未登录，请先运行 boss login")
    with BossClient(credential=cred) as c:
        try:
            city_code = resolve_city(city)
            raw = c.search_geeks(query=keyword, city=city_code, page=page, encrypt_job_id=enc_job_id)
            geek_list = raw.get("geekList", raw.get("list", []))
            candidates = [
                {
                    "encryptGeekId": g.get("encryptGeekId", ""),
                    "name": g.get("name", ""),
                    "age": g.get("age", ""),
                    "degree": g.get("degreeName", ""),
                    "experience": g.get("experienceName", ""),
                    "expectPosition": g.get("expectPosition", ""),
                    "expectSalary": g.get("expectSalaryDesc", ""),
                    "city": g.get("cityName", ""),
                    "activeTime": g.get("activeTimeDesc", ""),
                    "avatar": g.get("avatar", ""),
                    "skills": g.get("skills", []),
                    "encryptJobId": enc_job_id,
                }
                for g in geek_list
            ]
            _out({"ok": True, "data": candidates, "total": len(candidates)})
        except BossApiError as e:
            _err(str(e))


def main() -> None:
    parser = argparse.ArgumentParser(description="Boss CLI bridge for hr-platform")
    sub = parser.add_subparsers(dest="cmd")

    sub.add_parser("jobs")

    p_cand = sub.add_parser("candidates")
    p_cand.add_argument("--job", default="")
    p_cand.add_argument("--page", type=int, default=1)

    p_res = sub.add_parser("resume")
    p_res.add_argument("geek_id")
    p_res.add_argument("--job", required=True)
    p_res.add_argument("--security-id", default="")

    p_search = sub.add_parser("search")
    p_search.add_argument("keyword")
    p_search.add_argument("--city", default="上海")
    p_search.add_argument("--page", type=int, default=1)
    p_search.add_argument("--job", default="")

    args = parser.parse_args()

    if args.cmd == "jobs":
        cmd_jobs()
    elif args.cmd == "candidates":
        cmd_candidates(enc_job_id=args.job, page=args.page)
    elif args.cmd == "resume":
        cmd_resume(encrypt_geek_id=args.geek_id, encrypt_job_id=args.job, security_id=args.security_id)
    elif args.cmd == "search":
        cmd_search(keyword=args.keyword, city=args.city, page=args.page, enc_job_id=args.job)
    else:
        parser.print_help()
        sys.exit(1)


if __name__ == "__main__":
    main()
