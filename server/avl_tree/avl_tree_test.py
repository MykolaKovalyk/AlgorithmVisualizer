import unittest
import random
from avl_tree import AVLTree
from math import log2

class Film:

    def __init__(self, name, year, duration_in_minutes, genre, studio):
        self.name = name
        self.year = year
        self.duration_in_minutes = duration_in_minutes
        self.genre = genre
        self.studio = studio


    def __str__(self):
        return  f'---------- film ---------- \n'\
                f'name: {self.name} \n' \
                f'year: {self.year} \n ' \
                f'genre: {self.genre} \n' \
                f'studio: {self.studio} \n' \
                f'duration: {self.duration_in_minutes}'


class MyTestCase(unittest.TestCase):

    def test_binary_tree(self):

        def run_test():
            names = [
                'Top gun',
                'Avatar',
                'Illovaysk',
                'Inception',
                'Pacific rim',
                'Transformers',
                'Interstellar',
                'Oblivion',
                'Dune',
                'Zahar Berkut',
                'World War Z',
                'Fury',
                'Harry Potter and the Sorcerer\'s Stone',
                'The Angry Birds Movie',
                'Valkyrie',
                'American Made',
                'Joker',
                'Deadpool',
                "Снайпер білий ворон",
                "Avengers",
                "Edge of tomorrow",
                "Zoopolis",
                "Some other movie"
                "I don't care",
                "I just need to test this",
                "As extensivelyas I can",
                "I have remembered one more movie",
                "Chang Chi",
                "Strange movie, right",
                '123Avatar',
                '123Top gun',
                '123Illovaysk',
                '123Inception',
                '123Pacific rim',
                '123Transformers',
                '123Interstellar',
                '123Oblivion',
                '123Dune',
                '123Zahar Berkut',
                '123World War Z',
                '123Fury',
                '123Harry Potter and the Sorcerer\'s Stone',
                '123The Angry Birds Movie',
                '123Valkyrie',
                '123American Made',
                '123Joker',
                '123Deadpool',
                "123Снайпер білий ворон",
                "123Avengers",
                "123Edge of tomorrow",
                "123Zoopolis",
                "123Some other movie"
                "123I don't care",
                "123I just need to test this",
                "123As extensivelyas I can",
                "123I have remembered one more movie",
                "123Chang Chi",
                "123Strange movie, right"
                '321Top gun',
                '321Avatar',
                '321Illovaysk',
                '321Inception',
                '321Pacific rim',
                '321Transformers',
                '321Interstellar',
                '321Oblivion',
                '321Dune',
                '321Zahar Berkut',
                '321World War Z',
                '321Fury',
                '321Harry Potter and the Sorcerer\'s Stone',
                '321The Angry Birds Movie',
                '321Valkyrie',
                '321American Made',
                '321Joker',
                '321Deadpool',
                "321Снайпер білий ворон",
                "321Avengers",
                "321Edge of tomorrow",
                "321Zoopolis",
                "321Some other movie"
                "321I don't care",
                "321I just need to test this",
                "321As extensivelyas I can",
                "321I have remembered one more movie",
                "321Chang Chi",
                "321Strange movie, right",
                '321123Avatar',
                '321123Top gun',
                '321123Illovaysk',
                '321123Inception',
                '321123Pacific rim',
                '321123Transformers',
                '321123Interstellar',
                '321123Oblivion',
                '321123Dune',
                '321123Zahar Berkut',
                '321123World War Z',
                '321123Fury',
                '321123Harry Potter and the Sorcerer\'s Stone',
                '321123The Angry Birds Movie',
                '321123Valkyrie',
                '321123American Made',
                '321123Joker',
                '321123Deadpool',
                "321123Снайпер білий ворон",
                "321123Avengers",
                "321123Edge of tomorrow",
                "321123Zoopolis",
                "321123Some other movie"
                "321123I don't care",
                "321123I just need to test this",
                "321123As extensivelyas I can",
                "321123I have remembered one more movie",
                "321123Chang Chi",
                "321123Strange movie, right"
            ]

            random.shuffle(names)

            test_list = []
            for i in range(len(names)):
                test_list.append(Film(
                    names[i],
                    random.randint(2000, 2022),
                    random.randint(120, 180),
                    'action',
                    'Hollywood'
                ))

            bin_tree = AVLTree()
            self.assertEqual(bin_tree.size(), 0)

            for film in test_list:
                bin_tree.append(film.name, film)

            self.assertEqual(bin_tree.size(), len(test_list))

            test_subject_1 = test_list[random.randint(0, len(test_list) - 1)]
            test_list.remove(test_subject_1)
            bin_tree.remove(test_subject_1.name)
            self.assertEqual(bin_tree.size(), len(test_list))

            test_subject_2 = test_list[random.randint(0, len(test_list) - 1)]
            test_list.remove(test_subject_2)
            bin_tree.remove(test_subject_2.name)
            self.assertEqual(bin_tree.size(), len(test_list))

            bin_tree.append(test_subject_1.name, test_subject_1)
            bin_tree.append(test_subject_2.name, test_subject_2)

            self.assertEqual(bin_tree[test_subject_1.name], test_subject_1)
            self.assertEqual(bin_tree[test_subject_2.name], test_subject_2)

            bin_tree.insert(test_subject_1.name, test_subject_2)
            bin_tree[test_subject_2.name] = test_subject_1

            self.assertEqual(bin_tree[test_subject_1.name], test_subject_2)
            self.assertEqual(bin_tree[test_subject_2.name], test_subject_1)

            removed = [y for (x, y) in bin_tree.remove_by(
                lambda key, value: key is test_subject_1.name or key is test_subject_2.name)]
            self.assertIn(test_subject_1, removed)
            self.assertIn(test_subject_2, removed)

            self.assertEqual(bin_tree[test_subject_1.name], None)
            for film in test_list:
                self.assertEqual(bin_tree[film.name], film)

            self.assertEqual(bin_tree[test_subject_2.name], None)
            for film in test_list:
                self.assertEqual(bin_tree[film.name], film)

            self.assertLessEqual(bin_tree.get_max_depth(),  1.44*log2(bin_tree.size()+2)-0.328,  bin_tree.root.height)

            remove_test_list = list(test_list)
            while len(remove_test_list) > 0:
                i = len(remove_test_list) - 1
                to_remove = remove_test_list[i]
                remove_test_list.remove(to_remove)
                bin_tree.remove(to_remove.name)

                for film in remove_test_list:
                    self.assertEqual(bin_tree[film.name], film)

            self.assertEqual(bin_tree.size(), 0, bin_tree)

        for i in range(1000):
            run_test()


if __name__ == '__main__':
    unittest.main()
