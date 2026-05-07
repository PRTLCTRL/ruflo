#!/usr/bin/env python3
"""
Git operations helper script
Executes git commands for the tar CVE fix
"""
import subprocess
import sys
import os

def run_command(cmd, description):
    """Run a shell command and handle errors"""
    print(f"\n{description}...")
    print(f"  Command: {' '.join(cmd)}")
    try:
        result = subprocess.run(
            cmd,
            cwd="/workspace",
            capture_output=True,
            text=True,
            check=False
        )
        if result.returncode == 0:
            print(f"  ✓ Success")
            if result.stdout:
                print(f"  Output: {result.stdout.strip()}")
            return True
        else:
            print(f"  ✗ Failed (exit code {result.returncode})")
            if result.stderr:
                print(f"  Error: {result.stderr.strip()}")
            return False
    except Exception as e:
        print(f"  ✗ Exception: {e}")
        return False

def main():
    os.chdir("/workspace")
    
    print("=== Git Operations for tar CVE Fix ===")
    
    # Check current branch
    result = subprocess.run(
        ["git", "branch", "--show-current"],
        capture_output=True,
        text=True
    )
    current_branch = result.stdout.strip()
    print(f"\nCurrent branch: {current_branch}")
    
    # Create new branch
    branch_name = "cursor/fix-tar-cve-1608-04c9"
    if current_branch != branch_name:
        if not run_command(
            ["git", "checkout", "-b", branch_name],
            f"Creating branch {branch_name}"
        ):
            print("\n⚠ Branch creation failed, trying to switch to existing branch...")
            run_command(
                ["git", "checkout", branch_name],
                f"Switching to {branch_name}"
            )
    
    # Stage files
    files = [
        "v3/@claude-flow/security/package.json",
        "v3/@claude-flow/security/test-tar-fix.sh",
        "v3/@claude-flow/security/GIT_INSTRUCTIONS.md",
        "v3/@claude-flow/security/git-helper.py"
    ]
    
    for file in files:
        run_command(["git", "add", file], f"Staging {file}")
    
    # Check if there are changes to commit
    result = subprocess.run(
        ["git", "diff", "--staged", "--quiet"],
        capture_output=True
    )
    
    if result.returncode != 0:  # There are staged changes
        # Commit
        commit_message = """sec(deps): fix HIGH tar CVEs via npm overrides (GHSA-34x7 et al.)

Adds npm overrides block to @claude-flow/security/package.json forcing
tar >=7.5.11 for all transitive dependencies. Resolves 6 HIGH-severity
CVEs inherited through bcrypt → @mapbox/node-pre-gyp → tar@6.2.1.

The vulnerability chain:
  @claude-flow/security → bcrypt@5.1.1 → @mapbox/node-pre-gyp@1.0.11 → tar@6.2.1

Affected CVEs (all HIGH severity):
- GHSA-34x7-hfp2-rc4v: Arbitrary File Creation/Overwrite via Hardlink Path Traversal
- GHSA-8qq5-rm4j-mr97: Arbitrary File Overwrite and Symlink Poisoning
- GHSA-83g3-92jg-28cx: Arbitrary File Read/Write via Hardlink Target Escape
- GHSA-qffp-2rhf-9h96: Hardlink Path Traversal via Drive-Relative Linkpath
- GHSA-9ppj-qmqm-q256: Symlink Path Traversal via Drive-Relative Linkpath
- GHSA-r6q2-hw4h-h46w: Race Condition in node-tar Path Reservations

The override forces npm to install tar@>=7.5.11 for ALL packages in the tree,
including transitive dependencies that would otherwise pull vulnerable versions.

Downstream consumers no longer need their own overrides block — this fix
protects them automatically.

Fixes #1608"""
        
        run_command(
            ["git", "commit", "-m", commit_message],
            "Committing changes"
        )
    else:
        print("\n⚠ No staged changes to commit")
    
    # Push
    if not run_command(
        ["git", "push", "-u", "origin", branch_name],
        f"Pushing {branch_name}"
    ):
        print("\n⚠ Push failed - you may need to run this manually:")
        print(f"  git push -u origin {branch_name}")
        return 1
    
    print("\n=== Git operations completed successfully ===")
    print(f"\nBranch: {branch_name}")
    print("Next steps:")
    print("1. Test the fix by running: cd v3/@claude-flow/security && ./test-tar-fix.sh")
    print("2. Create a PR on GitHub")
    return 0

if __name__ == "__main__":
    sys.exit(main())
