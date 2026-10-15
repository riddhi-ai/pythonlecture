f = open("sample.txt", "r")  #open the file
f.seek(10)                   #jump to the 10th character position
print(f.read(5))             #print the next 5 characters
f.close()                    #close the file