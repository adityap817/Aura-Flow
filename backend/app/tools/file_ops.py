import os

SANDBOX_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../sandbox"))

def setup_sandbox():
    if not os.path.exists(SANDBOX_DIR):
        os.makedirs(SANDBOX_DIR)

def ensure_in_sandbox(file_path: str) -> str:
    """Ensure the path is within the sandbox directory."""
    setup_sandbox()
    # Prevent directory traversal attacks
    normalized_path = os.path.normpath(os.path.join(SANDBOX_DIR, file_path))
    if not normalized_path.startswith(SANDBOX_DIR):
        raise ValueError(f"Access denied: path '{file_path}' is outside the sandbox.")
    return normalized_path

def write_file(filename: str, content: str) -> str:
    """Safely writes or overwrites a file in the sandbox."""
    try:
        filepath = ensure_in_sandbox(filename)
        # Ensure subdirectories exist
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        return f"Successfully wrote to {filename}"
    except Exception as e:
        return f"Error writing file: {e}"

def read_file(filename: str) -> str:
    """Safely reads a file from the sandbox."""
    try:
        filepath = ensure_in_sandbox(filename)
        if not os.path.exists(filepath):
            return f"Error: File {filename} not found."
        with open(filepath, "r", encoding="utf-8") as f:
            return f.read()
    except Exception as e:
        return f"Error reading file: {e}"
