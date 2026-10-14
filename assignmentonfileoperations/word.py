sentence = input("Enter a sentence: ") #input from the user
words_list = sentence.split()  #split the sentence into words and store them in a list

#checked if the list is not empty 
if words_list:
  #found the longest word using max() with the length function (len) as the key
  longest_word = max(words_list, key=len)
  print("Words list:", words_list)
  print("The longest word is:", longest_word)
else:
  print("No words entered.")