f = open("vowels.txt", "r")  #opened the file "vowels.txt" in read mode
text = f.read()  #read the content from the file
count = 0

for ch in text.lower():
    if ch in "AEIOUaeiou":
        count += 1   #increases count by 1

print("Total vowels:", count)
f.close()