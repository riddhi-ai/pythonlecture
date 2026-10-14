file = open("vowels.txt", "r") #opened file in read mode
content = file.read()# read its content

words_list = content.split() #split the content into words using split() and store them in a list

#i.to print the total number of words
print("Total number of words:", len(words_list))

# ii. Print all unique words using set() to remove duplicates
unique_words = list(set(words_list))
print("All unique words:", unique_words)

file.close() #closed the file