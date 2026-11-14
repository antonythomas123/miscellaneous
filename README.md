# User Story 1

## As a system, for High Risk Countries flow, if any of the mentioned countries is completed as country of tax residence, the below logic will be activated

### Journey 

- As a sytem, if the user chooses any of the below high risk countries:

|       Jurisdiction       |
|:------------------------:|
| Antigua and Barbuda      |
| Bahamas                  |
| Bahrain                  |
| Barbados                 |
| Cyprus                   |
| Dominica                 |
| Grenada                  |
| Saint Kitts and Nevis    |
| Saint Lucia              |
| Seychelles               |
| Turks and Caicos Islands |
| United Arab Emiratesa    |
| Vanuatu                  |

- The following questions will be populated as follows for each country in table:
    1. "Did you obtain residence rights in xxx (Country name) under a investment/Residency by Investment scheme?"
        - No: the questions (2, 3, 4) will not be populated
        - Yes: The questions (2, 3, 4) will be populated noting that if any 2 or more countries is completed as country of tax residence, questions (2) will not be populated
            - This question is mandatory with two values Yes/No
            - Note: This question needs to be repeated for each country mentioned in the above table in case more than one country is completed as country of tax residence

    2. Do you hold residence rights in any other jurisdiction(s) ?
        - No
        - Yes: The following field will be populated "Please specify the country"
            - If completed country is not mentioned in the table of country of tax residence, The country will be added automatically to the countries of tax residence

    3. Have you spent more than 90 days in any other jurisdiction(s) during the previous year?
        - No
        - Yes: The following field will be populated "Please specify the country"
            - If completed country is not mentioned in the table of country of tax residence, the following mandatory question will be populated: "Do you want to add x country as country of tax residence ?"
             - If the user answers this question as Yes, the system will add automatically the country of the countries of tax residence
             - If the user answers this question as No, the field "Account Holder Reasonable Explanation related to the country(ies) of Tax Residence" will be enabled

    4. In which jurisdiction(s) have you filled personal income tax returns during the previous year ?
        - If the completed country is not mentioned in the table of country of tax residence, the following mandatory question will be populated:
            - Do you want to add x country as country of tax residence?
                - If the client answers this question as Yes, the system will add automatically the country to the countries of tax residence. If the client answers this question as No, the field "Account Holder Reasonable Explanation related to the country(ies) of Tax Residence" will be enabled  


# User story 2
## As a user, If I click on "Review CRS Self certification form" and one of the CRS Indicia are not completed as a country of tax residence, then a mandatory question needs to be populated to the client for each missing country

### Journey

- If the user wants to proceed with the flow and a country applied in one of the CRS Indicia fields, is not added within the CRS countries, then a popup question will appear "Do you want to add x country completed in the x field as country of tax residence?" where x represents the missing country.
- If the user anwers this question as Yes, the system will add the x country as country of tax residence in the countries of tax residence table
- If the user answers this question as No, the field "Reasonable Explanation related to the country(ies) of Tax residence" should be enabled and mandatory
- The field "Reasonable Explanation related to the country(ies) of Tax Residence", will be a drop down list and we will provide you with a the updated list. The option "Others" will be removed from the list.
- CRS Indicia fields is specified as below:
    - Country of Residency in Personal details section
    - Country in Residential Address
    - Country in Employment details