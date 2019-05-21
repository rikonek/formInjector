# formInjector

Data form injector

# Install

Get Tampermonkey:
- Chrome - https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo
- FireFox - https://addons.mozilla.org/pl/firefox/addon/tampermonkey

Go to Tampermonkey Dashboard -> Utilities -> Url

Paste script URL ```https://raw.githubusercontent.com/rikonek/formInjector/master/formInjector.js``` and click ```Import```

# Usage

Click ```Add to database``` and paste data from spreadsheet software.

| | A | B | C | D | E | F |
|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| 1 | apple | pear | pineapple | grapes | plum | banana |
| 2 | strawberry | raspberry | currant | peach | watermelon | cherry |
| 3 | orange | grapefruit | lemon | kiwi | pomegranate | mango |

Then you can inject data to web forms.

## Exlude columns

You can exclude columns added to database. Please enter the number of columns starting from 1.

| A | B | C | D | E | F |
|:-:|:-:|:-:|:-:|:-:|:-:|
| 1 | 2 | 3 | 4 | 5 | 6 |

If you exlude ```2,4``` your data will be:

| | A | C | E | F |
|:-:|:-:|:-:|:-:|:-:|
| 1 | apple | pineapple | plum | banana |
| 2 | strawberry | currant | watermelon | cherry |
| 3 | orange | lemon | pomegranate | mango |

## Template

Each row in the template means columns.
If you want to use column from a database, place the column number between ```[]```
The template replaces the exclusion.

```
[1]
hello
[3]
[6]
world
[3]
```
Your data will be injected in this form:

| | A | B | C | D | E | F |
|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| 1 | apple | hello | pineapple | banana | world | pineapple |
| 2 | strawberry | hello | currant | cherry | world | currant |
| 3 | orange | hello | lemon | mango | world | lemon |
