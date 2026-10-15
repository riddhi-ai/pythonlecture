f = open("practice_1/sample.txt", "r")  #open the file
lines = f.readlines()       #read all lines
print(lines[2])             #print the 3rd line using indexing
f.close()                   #close the file