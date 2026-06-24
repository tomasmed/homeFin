#!/usr/bin/env python3
"""Quick API integration tests for HomeFin backend.

Run this script to verify all API endpoints work correctly.
This is a simple Python alternative to manual_tests.sh - same tests, Python format.
"""

import subprocess
import json
import sys

BASE_URL = "http://localhost:8000/v1"

tests_passed = 0
tests_failed = 0


def run_curl_test(name, command, expected_status=200, expected_in_response=None):
    """Run a curl command and verify results."""
    print(f"\n>>> {name}")
    result = subprocess.run(command, shell=True, capture_output=True, text=True, timeout=10)
    
    try:
        response = json.loads(result.stdout)
    except json.JSONDecodeError:
        response = {"raw": result.stdout[:200]}
    
    if result.returncode != 0 or response.get("detail") == "Not Found":
        print(f"  ❌ FAILED")
        print(f"  Status: {result.returncode}")
        print(f"  Error: {response.get('detail', result.stderr)}")
        return False
    
    if "status" in response:
        assert response["status"] == "healthy", f"Expected healthy"
        print(f"  ✅ PASS")
        print(f"  Result: {response}")
        return True
    
    if expected_in_response and expected_in_response not in str(response):
        print(f"  ⚠️  WARNING: expected '{expected_in_response}' not found in response")
        print(f"  Response: {response}")
        return
    
    print(f"  ✅ PASS")
    print(f"  Result: {json.dumps(response, indent=2)[:500]}...")
    return True


def main():
    global tests_passed, tests_failed
    
    print("=" * 60)
    print("HomeFin API Integration Tests")
    print("=" * 60)
    
    # Test 1: Health check
    if run_curl_test("1. Health Check", "curl -s http://localhost:8000/health"):
        tests_passed += 1
    else:
        tests_failed += 1
    
    # Test 2: Root endpoint
    if run_curl_test("2. Root Endpoint", "curl -s http://localhost:8000/"):
        tests_passed += 1
    else:
        tests_failed += 1
    
    # Test 3: List accounts
    accounts_response = run_curl_test(
        "3. List Accounts",
        f"curl -s {BASE_URL}/api/accounts",
        expected_in_response="accounts"
    )
    if accounts_response:
        tests_passed += 1
    else:
        tests_failed += 1
    
    # Test 4: Create account
    if run_curl_test("4. Create Account", "curl -s -X POST http://localhost:8000/v1/api/accounts \
  -H \"Content-Type: application/json\" \
  -d '{\"name\":\"Test\",\"institution\":\"Test Bank\",\"account_type\":\"checking\",\"currency\":\"USD\"}'"):
        tests_passed += 1
    else:
        tests_failed += 1
    
    # Test 5: Categories
    if run_curl_test("5. List Categories", f"curl -s {BASE_URL}/api/categories", expected_in_response="categories"):
        tests_passed += 1
    else:
        tests_failed += 1
    
    # Test 6: Transactions (all)
    if run_curl_test("6. List All Transactions", f"curl -s {BASE_URL}/api/transactions"):
        tests_passed += 1
    else:
        tests_failed += 1
    
    # Summary
    print("\n" + "=" * 60)
    print(f"Results: {tests_passed} passed, {tests_failed} failed")
    print("=" * 60)
    
    return tests_failed > 0


if __name__ == "__main__":
    exit(0 if not main() else 1)
