#Cube Sum of N natural numbers
n = int(input("Enter n: "))
cubesum = (n * (n + 1) // 2) ** 2  #formula for cube of nums instead of multiple loops
print("Cube sum =", cubesum)


