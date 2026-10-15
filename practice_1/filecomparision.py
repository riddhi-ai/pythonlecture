#opened the first file and read its content
f = open("practice_1/file1.txt", "r")
data1 = f.read()
f.close()

#opened the second file and read its content
f = open("practice_1/sample.txt", "r")
data2 = f.read()
f.close()

#Compared both files
if data1 == data2:
    print("Files are identical")
else:
    print("Files are different")