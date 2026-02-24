import subprocess
import os

SANDBOX_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../sandbox"))

def run_command(command: str, timeout: int = 30) -> dict:
    """Runs a command safely within the sandbox directory."""
    if not os.path.exists(SANDBOX_DIR):
        os.makedirs(SANDBOX_DIR)
        
    try:
        result = subprocess.run(
            command,
            shell=True,
            cwd=SANDBOX_DIR,
            capture_output=True,
            text=True,
            timeout=timeout
        )
        return {
            "stdout": result.stdout,
            "stderr": result.stderr,
            "returncode": result.returncode
        }
    except subprocess.TimeoutExpired:
        return {
            "stdout": "",
            "stderr": f"Command execution timed out after {timeout} seconds.",
            "returncode": 1
        }
    except Exception as e:
        return {
            "stdout": "",
            "stderr": f"Execution error: {str(e)}",
            "returncode": 1
        }
