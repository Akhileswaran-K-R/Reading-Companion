import json

def generate():
    questions = []
    for i in range(1, 21):
        questions.append({
            "question": f"Question {i}",
            "bookmark_chunk_index": i * 10,
            "gold_chunk_indices": [i * 10 - 2, i * 10 - 1],
            "gold_answer": f"Answer {i}"
        })
    for i in range(21, 31):
        questions.append({
            "question": f"Spoiler Question {i}",
            "bookmark_chunk_index": 5,
            "gold_chunk_indices": [10, 11], 
            "gold_answer": f"Spoiler Answer {i}"
        })
    output_path = os.path.join(os.path.dirname(__file__), "questions.json")
    with open(output_path, "w") as f:
        json.dump(questions, f, indent=2)

if __name__ == "__main__":
    import os
    output_path = os.path.join(os.path.dirname(__file__), "questions.json")
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    generate()
