from app.services.preprocessing import preprocess_gutenberg

def test_preprocessing():
    sample = """*** START OF THE PROJECT GUTENBERG EBOOK ***
CHAPTER I
Hello world
CHAPTER II
Foo bar
*** END OF THE PROJECT GUTENBERG EBOOK ***"""
    pages = preprocess_gutenberg(sample)
    assert len(pages) == 2
    assert pages[0]["chapter"] == "CHAPTER I"
    assert pages[0]["text"] == "Hello world"
    assert pages[1]["chapter"] == "CHAPTER II"
    assert pages[1]["text"] == "Foo bar"
