"""
strip 
count
find
starts with
split
partition
lowercase
upper
capitalize first
letter occurrence count
position
replace
join list with separator
 """
text = "Myself Riddhi Naskari"

print("index:", text.index("R"))  #prints the index of element
print("rindex:", text.rindex("N")) #prints the index
print("startswith:", text.startswith("Myself"))  #retuens boolean value
print("endswith:", text.endswith("Naskari"))  #returns boolean value
print("count:", text.count("i")) #counts the element in list
print("capitalize", str.capitalize("riddhi")) #capitalize first letter
print(text.split())                          #splits the string
print(text.lower())                          #lowercase
print(text.upper())                          #uppercase
print(text.find("i"))                        #position (first occurrence)
print(text.replace("Myself","Hello"))        #replace
print("-".join(["a","b","c"]))              #join list with separator
print("strip:", text.strip())                 # removes spaces from start/end
print("split:", text.split())                 # splits into words
print("partition 'Riddhi':", text.partition("Riddhi"))  # splits into 3 parts
print("lower:", text.lower())                 # lowercase
print("upper:", text.upper())                 # uppercase





