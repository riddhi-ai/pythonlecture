#read all lines from the original file
f = open("sample.txt", "r")
lines = f.readlines()
f.close()

#copied and print only even-numbered lines
f = open("even.txt", "w")
for i, line in enumerate(lines, 1):
    if i % 2 == 0:
        print(line, end="")  #print the line
        f.write(line)        #saved the line to the file

f.close()