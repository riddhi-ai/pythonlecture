f = open("sample.txt", "r")  #open the file
lines = f.readlines()        #read all lines
for i, line in enumerate(lines, 1):  #starts numbering from 1
    print(i, ":", line.strip())      #print line number and text

f.close()  #closed the file