#read all words from the file
f = open("sample.txt", "r")
words = f.read().split()
f.close()

#count how many times each word appears
freq = {}
for word in words:
    freq[word] = freq.get(word, 0) + 1

#displayed the word counts
print(freq)