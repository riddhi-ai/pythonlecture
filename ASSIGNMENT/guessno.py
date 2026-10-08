#write a program to guess a number a hint use random range function

import random

num = random.randrange(1, 11)
guess = int(input("Guess 1-10: "))
print("Secret number was:", num)


if guess == num:
    print("Correct!")
elif guess < num:
    print("Too low!")
else:
    print("Too high!")

"""
# fixed secret number
secret = 13 

guess = int(input("Guess 1-20: "))

if guess == secret:
    print("Correct you have won a reward!")
elif guess < secret:
    print("Too low!")
else:
    print("Too high!")
"""