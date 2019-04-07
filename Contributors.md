                                                            Contributing To Exerciser React

## Contributing to Exerciser React is a excellent way to get involved, meet the community and to improve  Sugar Labs!
The Sugarizer Exerciser Activity is an Academic focused Activity for the Sugarizer Platform. It provides Teachers to build interactive Exercises for students, using multiple templates, and share them with their Students using the sugarizer-server.

## General Guidelines

Please follow these general guidelines.

    DO commit to master directly. Even for the smallest and most trivial fix.
    ALWAYS open a pull request and ask somebody else to merge your contribution.
    NEVER merge it yourself.

## Edit

Head over to the https://github.com/llaske/ExerciserReact

 You can then click the Fork button in the upper-right area of the screen to create a copy of our site in your GitHub account called a fork.

Make any changes you want in your fork, and when you are ready to send those changes to us, go to the index page for your fork and click New Pull Request to let us know about it.

    Fill in the text-box Commit changes at the end of the page telling why you did the changes.
    Press the button Commit changes next to it when you are done.
    Head to the green New pull request button (e.g., by navigating to your fork’s root and clicking Pull requests on the right menu-bar.
    Click Send pull request.

This is the recommended way for smaller changes, and for people who are not familiar with Git.

Your changes are now queued for review under project’s Pull requests tab on GitHub.

For more information about writing documentation please read the styleguide and also our docs about helper tools.

You will receive a message when your request has been integrated into the documentation.

At that moment, feel free to delete the copy of the documentation you created under your account on GitHub.

Next time you contribute, fork again. That way you’ll always have a fresh copy of the documentation to work on.



## Before You Make A Pull Request


    Before you commit your changes, it’s a good idea to run a spell check.
    Make sure that all links you put in are valid.
    Check that you are using valid restructured text.

   #### Setting up the development environment

Copy the lib folder, inside the main directory of the project folder, into the node_modules folder (after npm install). These are dependencies required by the sugarizer platform.

```bash
mkdir node_modules/lib
cp -r lib/* node_modules/lib
```


##### As a React App (No Sugarizer Features):

```bash
npm run start
```

##### As a Sugarizer Activity inside Sugarizer:
This step requires sugarizer. The steps to get Sugarizer working on your machine can be found here:
[Sugarizer](https://github.com/llaske/sugarizer)




## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b feature/feature_name`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin feature/feature_name`)
5. Create a new Pull Request



