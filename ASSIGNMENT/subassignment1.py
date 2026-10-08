#to replace all the vowels from my name to z
name = "Riddhi"
vowels = "aeiouAEIOU"

for v in vowels:
    name = name.replace(v, "z")

print(name)
