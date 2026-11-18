
file = open("vowels.txt", "r") #Opened the file in read mode
lines = file.readlines() #Read all lines from the file into a list

print("Total number of lines:", len(lines)) #Print the total number of lines
print("2nd line:", lines[1].strip()) #Display the 2nd line (index 1) using strip()

#Display the 4th line (index 3) if not then:
if len(lines) >= 4:
  print("4th line:", lines[3].strip())
else:
  print("4th line: The file contains fewer than 4 lines.")

file.close() #Closed the file