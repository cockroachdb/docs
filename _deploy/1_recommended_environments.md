---
title: Recommended Environments
---

### A heading that's also an anchor

### Another heading that's also an anchor

{% highlight python %}
print('Welcome to the Pig Latin Translator!')
pyg = 'ay'

# Ask user to enter a word.
original = raw_input('Enter a word:')

# Check if user entered something, and check if entry is just letters.
if len(original) > 0 and original.isalpha():
    # Store entry in lowercase.
    word = original.lower()
    # Store just first letter of entry.
    first = word[0]
    # Store concatenation of word and first and pyg variables.
    new_word = word + first + pyg
    # Store new_word with first letter removed.
    new_word = new_word[1:len(new_word)]
    print(new_word)
else:
    print('empty')
{% endhighlight %}