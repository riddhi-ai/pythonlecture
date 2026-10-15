f = open("sample.txt", "w") #opened the file in write mode

f.write("Welcome to the magical world of Python") #write text into the file
f.close()

f = open("sample.txt", "r") #opened the file in read mode
print(f.read()) #print the file content
f.close() #closed the file