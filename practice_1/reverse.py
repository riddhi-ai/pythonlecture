#read all lines from the file
f = open("sample.txt", "r")
lines = f.readlines()
f.close()

#reverse the lines and print them
lines = lines[::-1]
print("Reversed content:")
print("".join(lines))

#to write reversed lines into another file
f = open("reverse.txt", "w")
f.writelines(lines)
f.close()