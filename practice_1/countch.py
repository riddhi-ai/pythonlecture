f = open("sample.txt", "r") #opened the file in read mode
data = f.read() #read the complete file
print("Total characters:", len(data)) #count and print the characters
f.close() #closed the file