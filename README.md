# farf

farf means find and rename files/directories

Small cli app recursively changes files and directories names

## <a name="installation"></a>Installation
```console
npm i -g farf
```

## <a name="help"></a>Help
```console
farf -h
```

## <a name="Example"></a>Example

Change all files and directories names containing 'old' string into 'new' in 5 directories deep

```console
farf -d 5 -f old -n new
```
or
```console
farf 5 old new
```
if `depth > 10 && depth <=15` next confirmation question will be seen:
```console
Are you sure to continue with such depth? (YES/NO):
```

